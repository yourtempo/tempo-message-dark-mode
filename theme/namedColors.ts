export const darkTheme = {
  type: "dark",

  base: {
    base: "#0B0B0C",
    background: "#1B1C1D",
    hover: "#252729",
    light: "#323338",
    divider: "#37383D",
    separator: "#404148",
    spinner: "#D1D3D6",
  },

  card: {
    background: "#232427",
    hover: "#2A2C2F",
  },

  well: {
    background: "#0B0B0C",
    hover: "#1B1C1D",
  },

  text: {
    primary: "#D1D3D6",
    mindful: "#989CA5",
    discreet: "#82868C",
  },

  accent: {
    primary: "#6D6BFF",
    positive: "#2FB552",
    median: "#FDCF40",
    danger: "#F1514E",
  },
};

export type Theme = typeof darkTheme;
