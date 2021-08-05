const fs = require("fs");

const file = fs.readFileSync("dist/dark-mode.iife.js");

const stringified = JSON.stringify(file.toString());

fs.writeFileSync(
  "dist/dark-mode.string.js",
  `export const DarkMode = ${stringified};`
);
fs.writeFileSync(
  "dist/dark-mode.string.d.ts",
  `export const DarkMode: string;`
);
