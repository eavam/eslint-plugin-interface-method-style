import interfaceMethodStyle from "./interface-method-style.js";
import { name, version } from "../package.json";

export = {
  meta: { name, version },
  rules: {
    "interface-method-style": interfaceMethodStyle,
  },
};
