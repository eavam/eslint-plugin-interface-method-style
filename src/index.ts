import interfaceMethodStyle from "./interface-method-style.ts";
import pkg from "../package.json" assert { type: "json" };

const namePlugin = "interface-method-style";

const rules = {
  "interface-method-style": interfaceMethodStyle,
};

const plugin = {
  meta: {
    name: pkg.name,
    version: pkg.version,
  },
  configs: {},
  rules,
};

Object.assign(plugin.configs, {
  recommended: {
    plugins: { [namePlugin]: plugin },
    rules: {
      "interface-method-style/interface-method-style": "error",
    },
  },
  "recommended-legacy": {
    plugins: [namePlugin],
    rules: {
      "interface-method-style/interface-method-style": "error",
    },
  },
});

export default plugin;
