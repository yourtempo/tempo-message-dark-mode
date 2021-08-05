import Color from "color";

interface Colors {
  bg: string;
  text: string;
  link: string;
}

/** Returns whether the document has dark mode rules */
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

/** Returns whether the document has a dark background */
const hasDarkBackground = (doc: Document) => {
  for (const element of doc.body.children) {
    try {
      const background = findBackgroundColor(element as HTMLElement);
      if (
        background &&
        element.clientHeight > 200 &&
        parseColor(background[1]).isDark()
      ) {
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
export const hasNativeDarkModeSupport = (doc: Document) => {
  const colorSchemeMeta = doc.head.querySelector(
    'meta[name="color-scheme"],meta[name="supported-color-schemes"]'
  );

  if (colorSchemeMeta?.getAttribute("content")?.includes("dark")) {
    return true;
  }

  if (hasDarkModeRules(doc)) {
    return true;
  }

  if (hasDarkBackground(doc)) {
    return true;
  }

  return false;
};

/** these attributes can contain colors */
const COLOR_ATTRS = ["fill", "stop-color", "stroke", "bgcolor", "color"];

/** elements with these attributes should be processed */
const INLINE_STYLE_SELECTOR = ["style", ...COLOR_ATTRS]
  .map((attr) => `[${attr}]`)
  .join(", ");

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
const SKIP_VALUES = ["none", "initial", "inherit", "transparent"];

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
    if (parsedColor.lightness() > 97) {
      return colors.bg;
    }

    // Convert almost-black colors to our text color
    if (parsedColor.lightness() < 10) {
      return colors.text;
    }

    const invertedLightness = 1 - parsedColor.lightness() / 100;
    const bgLightness = Color(colors.bg).lightness() / 100;

    if (parsedColor.saturationv() === 0) {
      const mix = (1 - invertedLightness) * (1 + bgLightness) - bgLightness;
      return Color(colors.bg)
        .mix(Color(colors.text), 1 - mix)
        .hex();
    } else {
      // Make sure the contrast stays correct in relation to
      // our not-quite-black background (~15% lightness).
      const newLightness =
        ((1 - bgLightness) * invertedLightness + bgLightness) * 100;
      return parsedColor.lightness(newLightness).hex();
    }
  } catch (e) {
    console.log("Cannot parse", color, "on", backgroundColor);
    return color;
  }
};

/** Finds the closest element with a background color and returns its value */
const findBackgroundColor = (el: HTMLElement): [HTMLElement, string] | null => {
  if (el.tagName === "BODY" || el.tagName === "HTML") {
    return null;
  }

  const bgColor = el.getAttribute("bgcolor");

  if (
    el.style.backgroundColor &&
    !SKIP_VALUES.includes(el.style.backgroundColor)
  ) {
    return [el, el.style.backgroundColor];
  } else if (bgColor) {
    return [el, bgColor];
  } else if (el.parentElement) {
    return findBackgroundColor(el.parentElement);
  } else {
    return null;
  }
};

/** Finds the closest element with a background image and returns its value */
const findBackgroundImage = (el: HTMLElement): [HTMLElement, string] | null => {
  if (el.tagName === "BODY" || el.tagName === "HTML") {
    return null;
  }

  if (
    el.style.backgroundImage &&
    !SKIP_VALUES.includes(el.style.backgroundImage)
  ) {
    return [el, el.style.backgroundImage];
  } else if (
    // When the element has a background color,
    // let the backgroundColor method decide
    el.style.backgroundColor &&
    !SKIP_VALUES.includes(el.style.backgroundColor)
  ) {
    return null;
  } else if (el.parentElement) {
    return findBackgroundImage(el.parentElement);
  } else {
    return null;
  }
};

export const overrideStyleColors = (doc: Document, colors: Colors) => {
  for (const sheet of doc.styleSheets) {
    for (const rule of sheet.cssRules) {
      if (rule.type !== CSSRule.STYLE_RULE) {
        continue;
      }

      const style = (rule as CSSStyleRule).style;

      for (const key of COLOR_STYLES as any[]) {
        if (style[key]) {
          style[key] = generateInvertedColor(style[key], undefined, colors);
        }
      }
    }
  }
};

/** Processes the document and adds dark mode styles to it */
export const generateDarkModeStyles = (
  colors: Colors,
  doc: Document = document
) => {
  if (hasNativeDarkModeSupport(doc)) {
    return;
  }

  overrideStyleColors(doc, colors);

  for (const [key, color] of Object.entries(colors)) {
    doc.documentElement.style.setProperty(`--tempo-${key}`, color);
  }

  const style = doc.createElement("style");
  style.textContent = darkModeStyles;
  doc.body.append(style);

  doc.body.querySelectorAll(INLINE_STYLE_SELECTOR).forEach((e) => {
    const element = e as HTMLElement;
    const style = element.style;

    const bgColor = findBackgroundColor(element);
    const bgImage = findBackgroundImage(element);

    // Invert inline styles
    for (const key of COLOR_STYLES as any[]) {
      // Only touch borders on elements with
      // background images, skip all child elements
      if (
        bgImage &&
        !bgColor &&
        (!key.startsWith("border") || bgImage[0] !== element)
      ) {
        element.setAttribute(`data-on-bg-image`, "true");
        continue;
      }

      if (style[key] && style[key] !== "initial") {
        style[key] = generateInvertedColor(style[key], bgColor?.[1], colors);
      }
    }

    // Invert colors in other attributes
    for (const attr of COLOR_ATTRS) {
      if (bgImage) {
        continue;
      }

      const value = element.getAttribute(attr);
      if (value) {
        const inverted = generateInvertedColor(value, bgColor?.[1], colors);
        element.setAttribute(attr, inverted);
      }
    }
  });

  doc.body.style.removeProperty("color");
  doc.body.style.removeProperty("background");
};
