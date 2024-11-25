# eslint-plugin-interface-method-style

> ESLint rule to enforce consistent method implementation styles between TypeScript interfaces and their implementations.

## Installation

```sh
$ npm install eslint-plugin-interface-method-style --save-dev
```

```sh
$ yarn add eslint-plugin-interface-method-style --dev
```

```sh
$ pnpm add eslint-plugin-interface-method-style --save-dev
```

## Usage

Add `interface-method-style` to the plugins section of your `.eslintrc` configuration file. You can omit the `eslint-plugin-` prefix:

```json
{
  "plugins": ["interface-method-style"]
}
```

Then configure the rules you want to use under the rules section.

```json
{
  "rules": {
    "interface-method-style/interface-method-style": "error"
  }
}
```

## Rule Details

This rule ensures that methods defined in interfaces are implemented in classes using the same style:

- Methods defined with `method(): void` must be implemented as methods
- Properties defined with `method: () => void` must be implemented as arrow functions

### ✅ Correct

```ts
interface Foo {
  method(): void;
  property: () => void;
}

class Bar implements Foo {
  method() {
    console.log("method");
  }

  property = () => {
    console.log("property");
  };
}
```

### ❌ Incorrect

```ts
interface Foo {
  method(): void;
  property: () => void;
}

class Bar implements Foo {
  method = () => {
    console.log("method");
  };

  property() {
    console.log("property");
  }
}
```
