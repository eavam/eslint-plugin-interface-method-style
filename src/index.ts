import interfaceMethodStyle from "./interface-method-style.js";
import { type ESLint, type Linter } from "eslint";

const namePlugin = "interface-method-style";

const rules = {
  "interface-method-style": interfaceMethodStyle,
};

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

const pluginExport = {
  ...plugin,
  configs: {
    recommended: config,
  },
};

export default pluginExport;
