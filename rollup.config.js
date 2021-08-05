import resolve from "@rollup/plugin-node-resolve";
import commonJs from "@rollup/plugin-commonjs";
import { terser } from "rollup-plugin-terser";
import typescript from "@rollup/plugin-typescript";

export default {
  input: "src/dark-mode.ts",
  plugins: [commonJs(), resolve(), typescript(), terser()],
  output: {
    name: "DarkMode",
    file: "dist/dark-mode.iife.js",
    format: "iife",
    plugins: [terser()],
  },
};
