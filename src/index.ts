import interfaceMethodStyle from "./interface-method-style";
import pkg from "../package.json" assert { type: "json" };
import type { Linter, Rule, ESLint } from "eslint";

const namePlugin = "interface-method-style";

type Configs = {
  readonly recommended: Linter.Config;
  readonly "recommended-legacy": Linter.LegacyConfig;
};

export const rules: Record<string, Rule.RuleModule> = {
  [namePlugin]: interfaceMethodStyle as unknown as Rule.RuleModule,
};

const plugin: ESLint.Plugin & { configs: Configs } = {
  meta: {
    name: pkg.name,
    version: pkg.version,
  },
  configs: {} as Configs,
  rules,
};

export const configs: Configs = {
  recommended: {
    plugins: { [namePlugin]: plugin as unknown as ESLint.Plugin },
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
};

Object.assign(plugin.configs, configs);

export default { configs, rules };
