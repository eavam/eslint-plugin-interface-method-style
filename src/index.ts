import interfaceMethodStyle from "./interface-method-style.js";
import { name, version } from "../package.json";
import tseslint from "typescript-eslint";

const rules = {
  "interface-method-style": interfaceMethodStyle,
};

const flatConfig = {
  plugins: {
    "interface-method-style": {
      meta: { name, version },
      rules,
    },
  },
  rules: {
    "interface-method-style/interface-method-style": "error",
  },
  languageOptions: {
    languageOptions: {
      parser: tseslint.parser,
    },
  },
} as const;

const plugin = {
  configs: {
    flat: flatConfig,
  },
  rules,
};

export = plugin;
