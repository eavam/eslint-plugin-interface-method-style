import { RuleTester } from "@typescript-eslint/rule-tester";
import { describe, it } from "vitest";
import interfaceMethodStyle, { MessageId } from "./interface-method-style";
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
  ruleTester.run("interface-method-style", interfaceMethodStyle, {
    valid: [
      {
        code: `
          interface ITest {
            test(): void;
          }
          
          class Test implements ITest {
            test() {}
          }`,
      },
      {
        code: `
          interface ITest {
            test: () => void;
          }
          
          class Test implements ITest {
            test = () => {}
          }`,
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
          }`,
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
          }`,
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
          }`,
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
          }`,
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
          }`,
      },
      {
        code: `
          type ITest = {
            getData(): void;
          };
          
          class Test implements ITest {
            getData() { return "test"; }
          }`,
      },
      {
        code: `
          type ITest = {
            getData(): void;
          };
          
          const test: ITest = {
            getData() { return "test"; }
          }`,
      },
      {
        code: `
        interface ILogger {
          log(msg: string): void;
        }


        class Logger implements ILogger {
          log(msg: string) {
            console.log(msg);
          }
          static log = (msg: string) => console.log("static", msg);
        }


        class BadLogger implements ILogger {
          static log(msg: string) {
            console.log("static method", msg);
          }
          log = (msg: string) => console.log(msg);
        }`,
      },
      {
        code: `
          abstract class BaseWidget {
            abstract render(): void;
          }

          class GoodWidget extends BaseWidget {
            render() {
              console.log("render");
            }
          }`,
      },
      {
        code: `
          interface Converter {
            (n: number): string;
            (s: string): number;
          }

          interface IProcessor {
            convert: Converter;
          }

          class GoodProcessor implements IProcessor {
            convert(n: number): string;
            convert(s: string): number;
            convert(x: any): any {
              return typeof x === "number" ? String(x) : Number(x);
            }
          }`,
      },
      {
        code: `
          interface IFoo {
            foo(): void;
          }

          class Example implements IFoo {
            foo() {}

            private fooInternal = () => {};
            protected bar() {}
          }`,
      },
      {
        code: `
        interface IHandler {
          onClick(): void;
          onHover: () => void;
        }

        const handler = {
          onClick() {},
          onHover: () => {},
        } as IHandler;
      `,
      },
      {
        code: `
        function create<T>(v: T): T {
          return v;
        }

        const handler = create<IHandler>({
          onClick() {},
          onHover: () => {},
        });
        `,
      },
      // Валидные тесты для опции prefer: "method"
      {
        code: `
          interface ITest {
            test: () => void;
          }
          
          class Test implements ITest {
            test() {}
          }`,
        options: [{ prefer: "method" }],
      },
      {
        code: `
          interface ITest {
            test(): void;
          }
          
          class Test implements ITest {
            test() {}
          }`,
        options: [{ prefer: "method" }],
      },
      // Валидные тесты для опции prefer: "arrow"
      {
        code: `
          interface ITest {
            test(): void;
          }
          
          class Test implements ITest {
            test = () => {}
          }`,
        options: [{ prefer: "arrow" }],
      },
      {
        code: `
          interface ITest {
            test: () => void;
          }
          
          class Test implements ITest {
            test = () => {}
          }`,
        options: [{ prefer: "arrow" }],
      },
      // Валидные тесты для опции ignoreStatic: true (по умолчанию)
      {
        code: `
          interface ITest {
            test(): void;
          }
          
          class Test implements ITest {
            test() {}
            static test = () => {} // статический метод игнорируется
          }`,
      },
      {
        code: `
          interface ITest {
            test: () => void;
          }
          
          class Test implements ITest {
            test = () => {}
            static test() {} // статический метод игнорируется
          }`,
      },
      {
        code: `
          interface ITest {
            method(): void;
            prop: () => void;
          }
          
          class Test implements ITest {
            method() {}
            prop = () => {}
            static method = () => {} // статические методы игнорируются
            static prop() {}
          }`,
      },

      {
        code: `
          interface ITest {
            test(): void;
          }
          
          class Test implements ITest {
            test() {}
            static differentName = () => {} // другое имя - не конфликтует
          }`,
        options: [{ ignoreStatic: false }],
      },
      {
        code: `
          interface ITest {
            test(): void;
          }
          
          class Test {
          }`,
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
          }`,
        errors: [
          {
            messageId: MessageId.NeedArrow,
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
          }`,
        errors: [
          {
            messageId: MessageId.NeedMethod,
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
          }`,
        errors: [
          { messageId: MessageId.NeedArrow },
          { messageId: MessageId.NeedArrow },
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
          }`,
        errors: [
          { messageId: MessageId.NeedMethod },
          { messageId: MessageId.NeedMethod },
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
          }`,
        errors: [{ messageId: MessageId.NeedMethod }],
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
          }`,
        errors: [{ messageId: MessageId.NeedMethod }],
      },
      {
        code: `
          type ITest = {
            getData(): void;
          };
          
          class Test implements ITest {
            getData = () => "test";
          }`,
        errors: [{ messageId: MessageId.NeedMethod }],
      },
      {
        code: `
          type ITest = {
            getData(): void;
          };
          
          const test: ITest = {
            getData: () => "test",
          }`,
        errors: [{ messageId: MessageId.NeedMethod }],
      },
      {
        code: `
          type ITest = {
            getData: () => void;
          };
          
          const test: ITest = {
            getData() { return "test"; }
          }`,
        errors: [{ messageId: MessageId.NeedArrow }],
      },
      {
        code: `
          abstract class BaseWidget {
            abstract render(): void;
          }


          class Widget extends BaseWidget {
            render = () => console.log("render");
          }`,
        errors: [{ messageId: MessageId.NeedMethod }],
      },
      {
        code: `
          interface Converter {
            (n: number): string;
            (s: string): number;
          }

          interface IProcessor {
            convert: Converter;
          }

          class BadProcessor implements IProcessor {
            convert = (x: any) => String(x);
          }
        `,
        errors: [{ messageId: MessageId.NeedMethod }],
      },
      {
        code: `
        interface IFoo {
          foo(): void;
        }

        class Bar implements IFoo {
          foo!: () => void;
        }`,
        errors: [{ messageId: MessageId.NeedMethod }],
      },
      {
        code: `
        interface IHandler {
          onClick(): void;
          onHover: () => void;
        }

        const handler = {
          onClick: () => {},
          onHover() {},
        } as IHandler;
        `,
        errors: [
          { messageId: MessageId.NeedMethod },
          { messageId: MessageId.NeedArrow },
        ],
      },
      {
        code: `
        interface IHandler {
          onClick(): void;
          onHover: () => void;
        }

        function create<T>(v: T): T {
          return v;
        }

        const handler = create<IHandler>({
          onClick: () => {},
          onHover() {},
        });
        `,
        errors: [
          { messageId: MessageId.NeedMethod },
          { messageId: MessageId.NeedArrow },
        ],
      },
      {
        code: `
          interface ITest {
            test: () => void;
          }
          
          class Test implements ITest {
            test = () => {}
          }`,
        options: [{ prefer: "method" }],
        errors: [{ messageId: MessageId.NeedMethod }],
      },
      {
        code: `
          interface ITest {
            test(): void;
          }
          
          class Test implements ITest {
            test = () => {}
          }`,
        options: [{ prefer: "method" }],
        errors: [{ messageId: MessageId.NeedMethod }],
      },
      {
        code: `
          interface ITest {
            test(): void;
          }
          
          class Test implements ITest {
            test() {}
          }`,
        options: [{ prefer: "arrow" }],
        errors: [{ messageId: MessageId.NeedArrow }],
      },
      {
        code: `
          interface ITest {
            test: () => void;
          }
          
          class Test implements ITest {
            test() {}
          }`,
        options: [{ prefer: "arrow" }],
        errors: [{ messageId: MessageId.NeedArrow }],
      },
      {
        code: `
          interface ITest {
            test(): void;
          }
          
          class Test implements ITest {
            test() {}
            static test = () => {} // статический метод должен проверяться
          }`,
        options: [{ ignoreStatic: false }],
        errors: [{ messageId: MessageId.NeedMethod }],
      },
      {
        code: `
          interface ITest {
            test: () => void;
          }
          
          class Test implements ITest {
            test = () => {}
            static test() {} // статический метод должен проверяться
          }`,
        options: [{ ignoreStatic: false }],
        errors: [{ messageId: MessageId.NeedArrow }],
      },
      {
        code: `
          interface ITest {
            method(): void;
            prop: () => void;
          }
          
          class Test implements ITest {
            method() {}
            prop = () => {}
            static method = () => {} // статические методы должны проверяться
            static prop() {}
          }`,
        options: [{ ignoreStatic: false }],
        errors: [
          { messageId: MessageId.NeedMethod },
          { messageId: MessageId.NeedArrow },
        ],
      },
      // Комбинированные тесты: prefer + ignoreStatic
      {
        code: `
          interface ITest {
            test(): void;
          }
          
          class Test implements ITest {
            test() {}
            static test = () => {} // статический метод должен быть методом
          }`,
        options: [{ prefer: "method", ignoreStatic: false }],
        errors: [{ messageId: MessageId.NeedMethod }],
      },
      {
        code: `
          interface ITest {
            test: () => void;
          }
          
          class Test implements ITest {
            test = () => {}
            static test() {} // статический метод должен быть arrow
          }`,
        options: [{ prefer: "arrow", ignoreStatic: false }],
        errors: [{ messageId: MessageId.NeedArrow }],
      },
      {
        code: `
          type ITest = {
            getData(): void;
          };
          
          const test: ITest = {
            getData() { return "test"; }
          }`,
        options: [{ prefer: "arrow" }],
        errors: [{ messageId: MessageId.NeedArrow }],
      },
    ],
  });
});
