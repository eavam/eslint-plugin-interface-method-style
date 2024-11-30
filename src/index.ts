import interfaceMethodStyle from "./interface-method-style.js";
// import { name, version } from "../package.json";
// import * as typescriptParser from "@typescript-eslint/parser";
import { type ESLint, type Linter } from "eslint";

const namePlugin = "interface-method-style";

const rules = {
  "interface-method-style": interfaceMethodStyle,
};

// const flatConfig = {
//   plugins: {
//     "interface-method-style": {
//       meta: { name, version },
//       rules,
//     },
//   },
//   rules: {
//     "interface-method-style/interface-method-style": "error",
//   },
//   languageOptions: {
//     parser: typescriptParser,
//     parserOptions: {
//       projectService: true,
//       tsconfigRootDir: process.cwd(),
//     },
//   },
// } as const;

const plugin = {
  rules,
  name: namePlugin,
} as unknown as ESLint.Plugin;

const config: Linter.Config = {
  plugins: {
    [namePlugin]: plugin,
  },
  rules: {
    "interface-method-style/interface-method-style": "error",
  },
};

module.exports = {
  ...plugin,
  configs: {
    recommended: config,
  },
};
