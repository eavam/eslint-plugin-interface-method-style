import interfaceMethodStyle from "./interface-method-style.js";
import { name, version } from "../package.json";

const basePlugin = {
  meta: { name, version },
  rules: {
    "interface-method-style": interfaceMethodStyle,
  },
};

export = {
  configs: {
    plugins: {
      "interface-method-style": basePlugin,
    },
    rules: {
      "@typescript-eslint/interface-method-style": "error",
    },
  },
  ...basePlugin,
};
