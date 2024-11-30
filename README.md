# eslint-plugin-interface-method-style

> ESLint rule to enforce consistent method implementation styles between TypeScript interfaces and their implementations.

[![npm](https://img.shields.io/npm/v/eslint-plugin-interface-method-style)](https://www.npmjs.com/package/eslint-plugin-interface-method-style)
[![npm](https://img.shields.io/npm/dt/eslint-plugin-interface-method-style)](https://www.npmjs.com/package/eslint-plugin-interface-method-style)
![GitHub](https://img.shields.io/github/license/eavam/eslint-plugin-interface-method-style)
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Feavam%2Feslint-plugin-interface-method-style.svg?type=shield&issueType=license)](https://app.fossa.com/projects/git%2Bgithub.com%2Feavam%2Feslint-plugin-interface-method-style?ref=badge_shield&issueType=license)

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Rule Details](#rule-details)
- [License](#license)

## Introduction

In large TypeScript codebases, maintaining consistency between interfaces and their implementations is crucial for code readability and maintainability. This ESLint plugin ensures that methods and properties defined in TypeScript interfaces or type aliases are implemented using the same syntax in classes and object literals.

## Features

- 🎯 **Method Style Consistency**: Ensures consistent method and property styles.
- 🚀 **Supports Classes and Object Literals**: Works with classes and object literals.
- ✨ **TypeScript Compatibility**: Supports TypeScript interfaces and type aliases.

## Installation

### npm

```sh
npm install eslint-plugin-interface-method-style --save-dev
```

### Yarn

```sh
yarn add eslint-plugin-interface-method-style --dev
```

### pnpm

```sh
pnpm add eslint-plugin-interface-method-style --save-dev
```

## Usage

Add `interface-method-style` to your ESLint configuration.

### Config (eslint.config.mjs)

```js
import interfaceMethodStyle from "eslint-plugin-interface-method-style";

export default [
  // ...
  interfaceMethodStyle.configs.recommended,
];
```

### Legacy Config (.eslintrc.json)

Add `interface-method-style` to the plugins section of your configuration file. You can omit the `eslint-plugin-` prefix:

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

This rule enforces that the implementation of methods and properties matches their definitions in the interfaces or type aliases:

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

## License

[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Feavam%2Feslint-plugin-interface-method-style.svg?type=large&issueType=license)](https://app.fossa.com/projects/git%2Bgithub.com%2Feavam%2Feslint-plugin-interface-method-style?ref=badge_large&issueType=license)
