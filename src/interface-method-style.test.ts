import { RuleTester } from "@typescript-eslint/rule-tester";
import { describe, it } from "vitest";
import { rule } from "./interface-method-style";
import tsParser from "@typescript-eslint/parser";

RuleTester.afterAll = () => {};
RuleTester.describe = describe;
RuleTester.it = it;

const ruleTester = new RuleTester({
  languageOptions: {
    parser: tsParser,
    parserOptions: {
      ecmaVersion: "latest",
      sourceType: "script",
      project: "./tsconfig.json",
      projectService: {
        allowDefaultProject: ["*.ts*"],
      },
      tsconfigRootDir: "../src",
    },
  },
});

describe("interface-method-style", () => {
  ruleTester.run("interface-method-style", rule, {
    valid: [
      {
        code: `
          interface ITest {
            test(): void;
          }
          
          class Test implements ITest {
            test() {}
          }
        `,
      },
      {
        code: `
          interface ITest {
            test: () => void;
          }
          
          class Test implements ITest {
            test = () => {}
          }
        `,
      },
      {
        code: `
          interface ITest {
            test(): void;
            asyncMethod(): Promise<void>;
          }
          
          class Test implements ITest {
            test() {}
            asyncMethod() { return Promise.resolve(); }
          }
        `,
      },
      {
        code: `
          interface ITest {
            test(): void;
            asyncMethod: () => Promise<void>;
          }
          
          class Test implements ITest {
            test() {}
            asyncMethod = () => Promise.resolve();
          }
        `,
      },
      {
        code: `
          interface ITest {
            test: () => void;
            asyncArrow: () => Promise<void>;
          }
          
          class Test implements ITest {
            test = () => {}
            asyncArrow = async () => {}
          }
        `,
      },
      {
        code: `
          interface ITest {
            method(): number;
            prop: string;
          }
          
          class Test implements ITest {
            method() { return 42; }
            prop = "test";
          }
        `,
      },
      {
        code: `
          interface IWithGenerics<T> {
            getData(): T;
            setData(value: T): void;
          }
          
          class Generic implements IWithGenerics<string> {
            getData() { return "test"; }
            setData(value: string) {}
          }
        `,
      },
    ],
    invalid: [
      {
        code: `
          interface ITest {
            test: () => void;
          }
          
          class Test implements ITest {
            test() {}
          }
        `,
        errors: [
          {
            messageId: "whenUseArrowFunction",
          },
        ],
      },
      {
        code: `
          interface ITest {
            test(): void;
          }
          
          class Test implements ITest {
            test = () => {}
          }
        `,
        errors: [
          {
            messageId: "whenUseMethod",
          },
        ],
      },
      {
        code: `
          interface ITest {
            test: () => void;
            asyncMethod: () => Promise<void>;
          }
          
          class Test implements ITest {
            test() {}
            asyncMethod() { return Promise.resolve(); }
          }
        `,
        errors: [
          { messageId: "whenUseArrowFunction" },
          { messageId: "whenUseArrowFunction" },
        ],
      },
      {
        code: `
          interface ITest {
            test(): void;
            asyncMethod(): Promise<void>;
          }
          
          class Test implements ITest {
            test = () => {}
            asyncMethod = async () => {}
          }
        `,
        errors: [
          { messageId: "whenUseMethod" },
          { messageId: "whenUseMethod" },
        ],
      },
      {
        code: `
          interface IMixed {
            method(): void;
            prop: string;
          }
          
          class Mixed implements IMixed {
            method = () => {}
            prop() { return "wrong"; }
          }
        `,
        errors: [{ messageId: "whenUseMethod" }],
      },
      {
        code: `
          interface IComplex {
            callback(fn: () => void): void;
            data: { nested: () => string };
          }
          
          class Complex implements IComplex {
            callback = (fn: () => void) => {}
            data() { return { nested: () => "wrong" }; }
          }
        `,
        errors: [{ messageId: "whenUseMethod" }],
      },
    ],
  });
});
