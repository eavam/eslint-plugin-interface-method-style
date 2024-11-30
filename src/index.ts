import interfaceMethodStyle from "./interface-method-style.js";
import { name, version } from "../package.json";
import * as typescriptParser from "@typescript-eslint/parser";

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
    parser: typescriptParser,
    parserOptions: {
      tsconfigRootDir: process.cwd(),
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
