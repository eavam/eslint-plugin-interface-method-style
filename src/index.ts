import interfaceMethodStyle from "./interface-method-style.js";
import { type ESLint, type Linter } from "eslint";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const namePlugin = "interface-method-style";

const pkg = JSON.parse(
  readFileSync(
    resolve(dirname(fileURLToPath(import.meta.url)), "../package.json"),
    "utf8",
  ),
);

type PluginWithConfigs = ESLint.Plugin & { configs: Record<string, unknown> };

const plugin: PluginWithConfigs = {
  meta: {
    name: pkg.name,
    version: pkg.version,
    namespace: namePlugin,
  },
  rules: {
    "interface-method-style": interfaceMethodStyle,
  },
  configs: {},
} as unknown as PluginWithConfigs;

const flatRecommended = [
  {
    plugins: {
      [namePlugin]: plugin as unknown as ESLint.Plugin,
    },
    rules: {
      "interface-method-style/interface-method-style": "error",
    },
  },
] as unknown as Linter.Config[];

const legacyRecommended = {
  plugins: [namePlugin],
  rules: {
    "interface-method-style/interface-method-style": "error",
  },
} as unknown as Linter.Config;

Object.assign(plugin.configs, {
  "flat/recommended": flatRecommended,
  recommended: legacyRecommended,
});

export default plugin;
