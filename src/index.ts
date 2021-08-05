import Color from "color";
import pick from "lodash/pick";

interface Colors {
  bg: string;
  text: string;
  link: string;
}

const hasDarkModeRules = (doc: Document) => {
  for (const sheet of doc.styleSheets) {
    for (const rule of sheet.rules) {
      // Look for `@media (prefers-color-scheme: dark)` in styles
      if (rule.type === rule.MEDIA_RULE) {
        const mediaText = (rule as CSSMediaRule).media.mediaText;
        if (mediaText.includes("prefers-color-scheme: dark")) {
          return true;
        }
      }

      // Outlook appends this attribute to dark mode emails
      if (rule.cssText.includes("data-ogsc")) {
        return true;
      }
    }
  }

  return false;
};

const hasDarkBackground = (doc: Document, win: Window) => {
  for (const element of doc.body.children) {
    try {
      const background = win.getComputedStyle(element).backgroundColor;
      if (
        background &&
        element.clientHeight > 400 &&
        parseColor(background).isDark()
      ) {
        console.log(element, "has a dark background");
        return true;
      }
    } catch (e) {
      continue;
    }
  }

  return false;
};

/**
 * Returns whether the doc has its own styles for dark mode
 */
export const hasNativeDarkModeSupport = (doc: Document, win: Window) => {
  const colorSchemeMeta = doc.head.querySelector(
    'meta[name="color-scheme"],meta[name="supported-color-schemes"]'
  );

  if (colorSchemeMeta?.getAttribute("content")?.includes("dark")) {
    console.log("Color scheme meta includes dark");
    return true;
  }

  if (hasDarkModeRules(doc)) {
    console.log("Email has dark mode rules");
    return true;
  }

  if (hasDarkBackground(doc, win)) {
    console.log("Email has dark background");
    return true;
  }

  return false;
};

/** these attributes can contain colors */
const COLOR_ATTRS = ["fill", "stop-color", "stroke", "bgcolor", "color"];

/** these styles contain colors */
const COLOR_STYLES: Array<keyof CSSStyleDeclaration> = [
  "backgroundColor",
  "color",
  "fill",
  "stroke",
  "outlineColor",
  "stopColor",
  "borderTopColor",
  "borderBottomColor",
  "borderLeftColor",
  "borderRightColor",
  "textDecorationColor",
];

/** these CSS values can be skipped in processing */
const SKIP_VALUES = ["none", "initial", "transparent", "rgba(0, 0, 0, 0)"];

/**
 * Contains dark mode default styles. All colors
 * from the `COLORS` object above are available
 * as `--tempo-{key}` CSS variables.
 */
const darkModeStyles = `
	body {
		background-color: transparent !important;
		color: var(--tempo-text) !important;
	}

	a {
		color: var(--tempo-link);
	}
`;

/** Tries to parse a color string. Will throw an error if it fails. */
export const parseColor = (color: string) => {
  // Some colors in HTML attributes are missing the # char
  if (color.match(/^[a-f\d]{3}$|^[a-f\d]{6}$/)) {
    color = "#" + color;
  }

  return new Color(color);
};

/** Returns whether the given color is vibrant */
export const isVibrant = (color: Color, lightnessThreshold = 10) => {
  return color.saturationv() > 50 && color.lightness() >= lightnessThreshold;
};

/** Converts a light-mode color into a dark-mode one */
export const generateInvertedColor = (
  color: string,
  backgroundColor: string | undefined,
  colors: Colors
) => {
  if (SKIP_VALUES.includes(color)) {
    return color;
  }

  try {
    const parsedColor = parseColor(color);
    const parsedBackground = parseColor(backgroundColor ?? "white");

    const colorIsVibrant = isVibrant(parsedColor, 30);
    const backgroundIsVibrant = isVibrant(parsedBackground);

    // If the color or its background color
    // is too vibrant, don't invert it
    if (colorIsVibrant || backgroundIsVibrant) {
      return color;
    }

    // Convert almost-white colors to our background color
    if (parsedColor.lightness() > 95) {
      return colors.bg;
    }

    // Convert almost-black colors to our text color
    if (parsedColor.lightness() < 10) {
      return colors.text;
    }

    // Make sure the contrast stays correct in relation to
    // our not-quite-black background (~15% lightness).
    const invertedLightness = 1 - parsedColor.lightness() / 100;
    const bgLightness = Color(colors.bg).lightness() / 100;
    const newLightness =
      ((1 - bgLightness) * invertedLightness + bgLightness) * 100;

    return parsedColor.lightness(newLightness).hex();
  } catch (e) {
    console.log("Cannot parse", color, "on", backgroundColor);
    return color;
  }
};

/** Returns the element's direct styles without inherited ones */
const getDirectComputedStyles = (
  elementStyles: CSSStyleDeclaration,
  parentStyles: CSSStyleDeclaration
) => {
  const computedStyle = pick(elementStyles, COLOR_STYLES);

  for (const [key, value] of Object.entries(computedStyle)) {
    if (parentStyles[key as any] === value) {
      delete computedStyle[key as any];
    }
  }

  return computedStyle;
};

export const invertColors = (
  win: Window,
  doc: Document,
  colors: Colors,
  element: HTMLElement,
  parentStyles?: CSSStyleDeclaration,
  parentBgColor?: string,
  parentBgImage?: string
) => {
  let bgColor = parentBgColor;
  let bgImage = parentBgImage;
  const elementStyles = win.getComputedStyle(element);

  if (parentStyles) {
    const elementBgColor =
      elementStyles.backgroundColor ?? element.getAttribute("bgcolor");

    if (elementBgColor && !SKIP_VALUES.includes(elementBgColor)) {
      bgColor = elementBgColor;
    }

    const elementBgImage = elementStyles.backgroundImage;

    if (elementBgImage && !SKIP_VALUES.includes(elementBgImage)) {
      bgImage = elementBgImage;
    }

    // Invert inline styles
    for (const key of COLOR_STYLES as any[]) {
      // Only touch borders on elements with
      // background images, skip all child elements
      if (!bgImage && key.startsWith("border")) {
        continue;
      }

      if (elementStyles[key]) {
        element.style[key] = generateInvertedColor(
          elementStyles[key],
          bgColor,
          colors
        );
      }
    }

    // Invert colors in other attributes
    for (const attr of COLOR_ATTRS) {
      if (bgImage) {
        continue;
      }

      const value = element.getAttribute(attr);
      if (value) {
        const inverted = generateInvertedColor(value, bgColor, colors);
        element.setAttribute(attr, inverted);
      }
    }
  }

  for (const child of element.children) {
    if (child.nodeType !== Node.TEXT_NODE) {
      invertColors(
        win,
        doc,
        colors,
        child as HTMLElement,
        elementStyles,
        bgColor,
        bgImage
      );
    }
  }
};

/**
 * Processes the document and adds dark mode styles to it
 */
export const generateDarkModeStyles = (
  colors: Colors,
  win: Window = window,
  doc: Document = document
) => {
  if (hasNativeDarkModeSupport(doc, win)) {
    return;
  }

  invertColors(win, doc, colors, doc.body);

  for (const [key, color] of Object.entries(colors)) {
    doc.documentElement.style.setProperty(`--tempo-${key}`, color);
  }

  const style = doc.createElement("style");
  style.textContent = darkModeStyles;
  doc.body.append(style);

  doc.body.style.removeProperty("color");
  doc.body.style.removeProperty("background");
};
