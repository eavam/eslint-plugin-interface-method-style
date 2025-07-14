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
- [Configuration Options](#configuration-options)
- [Examples](#examples)
- [Advanced Use Cases](#advanced-use-cases)
- [License](#license)

## Introduction

In large TypeScript codebases, maintaining consistency between interfaces and their implementations is crucial for code readability and maintainability. This ESLint plugin ensures that methods and properties defined in TypeScript interfaces or type aliases are implemented using the same syntax in classes and object literals.

## Features

- 🎯 **Method Style Consistency**: Ensures consistent method and property styles between interfaces and implementations
- 🚀 **Classes and Object Literals**: Works with both class implementations and object literals
- ✨ **TypeScript Support**: Full support for TypeScript interfaces, type aliases, and abstract classes
- 🔧 **Flexible Configuration**: Customize behavior with `prefer` and `ignoreStatic` options
- 📦 **Function Overloads**: Smart handling of function overloads (always requires methods)
- 🏗️ **Abstract Classes**: Supports abstract method inheritance
- ⚡ **Performance Optimized**: Efficient class-level processing with caching

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
  interfaceMethodStyle.configs["flat/recommended"],
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

- **Method signatures** (`method(): void`) must be implemented as **methods**
- **Property signatures** (`method: () => void`) must be implemented as **arrow function properties**
- **Function overloads** always require **method** implementation
- **Abstract methods** must be implemented as **methods**

### ✅ Correct

```ts
interface Foo {
  method(): void; // Method signature
  property: () => void; // Property signature
}

class Bar implements Foo {
  method() {
    // ✅ Method implementation
    console.log("method");
  }

  property = () => {
    // ✅ Arrow function property
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
    // ❌ Should be a method: `method() { … }`
    console.log("method");
  };

  property() {
    // ❌ Should be an arrow-function property: `property = () => …`
    console.log("property");
  }
}
```

## Configuration Options

The rule accepts an options object with the following properties:

```ts
interface Options {
  prefer?: "method" | "arrow"; // Override interface signature preference
  ignoreStatic?: boolean; // Whether to ignore static members (default: true)
}
```

### `prefer` Option

When set, this option overrides the interface signature and enforces a consistent style for all methods:

#### `prefer: "method"`

Forces all function properties to be implemented as methods, regardless of interface signature:

```json
{
  "rules": {
    "interface-method-style/interface-method-style": [
      "error",
      { "prefer": "method" }
    ]
  }
}
```

```ts
interface Foo {
  method(): void;
  property: () => void; // Property signature
}

class Bar implements Foo {
  method() {} // ✅ Method
  property() {} // ✅ Method (overrides property signature)
}
```

#### `prefer: "arrow"`

Forces all function properties to be implemented as arrow functions, regardless of interface signature:

```json
{
  "rules": {
    "interface-method-style/interface-method-style": [
      "error",
      { "prefer": "arrow" }
    ]
  }
}
```

```ts
interface Foo {
  method(): void; // Method signature
  property: () => void;
}

class Bar implements Foo {
  method = () => {}; // ✅ Arrow function (overrides method signature)
  property = () => {}; // ✅ Arrow function
}
```

### `ignoreStatic` Option

Controls whether static members should be checked (default: `true`):

#### `ignoreStatic: true` (default)

Static members are ignored and won't be checked:

```ts
interface ILogger {
  log(msg: string): void;
}

class Logger implements ILogger {
  log(msg: string) {} // ✅ Checked
  static log = (msg: string) => {}; // ✅ Ignored (static)
}
```

#### `ignoreStatic: false`

Static members are checked like instance members:

```json
{
  "rules": {
    "interface-method-style/interface-method-style": [
      "error",
      { "ignoreStatic": false }
    ]
  }
}
```

```ts
interface ILogger {
  log(msg: string): void;
}

class Logger implements ILogger {
  log(msg: string) {} // ✅ Method
  static log = (msg: string) => {}; // ❌ Should be a method: `static log() { … }`
}
```

## Examples

### Basic Interface Implementation

```ts
interface UserService {
  getUser(): User;
  validateUser: (user: User) => boolean;
}

class UserServiceImpl implements UserService {
  getUser() {
    // ✅ Method signature → method
    return new User();
  }

  validateUser = (user: User) => {
    // ✅ Property signature → arrow function
    return user.isValid();
  };
}
```

### Object Literals

```ts
interface EventHandler {
  onClick(): void;
  onHover: () => void;
}

const handler: EventHandler = {
  onClick() {}, // ✅ Method signature → method
  onHover: () => {}, // ✅ Property signature → arrow function
};
```

### Type Aliases

```ts
type ApiClient = {
  get(url: string): Promise<Response>;
  post: (url: string, data: any) => Promise<Response>;
};

class HttpClient implements ApiClient {
  get(url: string) {
    // ✅ Method
    return fetch(url);
  }

  post = async (url: string, data: any) => {
    // ✅ Arrow function
    return fetch(url, { method: "POST", body: JSON.stringify(data) });
  };
}
```

## Advanced Use Cases

### Function Overloads

Function overloads always require method implementation:

```ts
interface Converter {
  convert(input: string): number;
  convert(input: number): string;
  convert(input: string | number): string | number;
}

class StringNumberConverter implements Converter {
  convert(input: string): number;
  convert(input: number): string;
  convert(input: string | number): string | number {
    // ✅ Must be method
    return typeof input === "string" ? Number(input) : String(input);
  }
}
```

### Abstract Classes

Abstract methods are treated as method signatures:

```ts
abstract class BaseWidget {
  abstract render(): void;
  abstract update: () => void;
}

class MyWidget extends BaseWidget {
  render() {
    // ✅ Abstract method → method
    console.log("rendering");
  }

  update = () => {
    // ✅ Abstract property → arrow function
    console.log("updating");
  };
}
```

### Mixed Configurations

Combine options for specific project needs:

```json
{
  "rules": {
    "interface-method-style/interface-method-style": [
      "error",
      {
        "prefer": "method",
        "ignoreStatic": false
      }
    ]
  }
}
```

This configuration:

- Forces all functions to be methods (`prefer: "method"`)
- Checks static members too (`ignoreStatic: false`)

### Complex Inheritance

```ts
interface IRepository<T> {
  find(id: string): T | null;
  save: (entity: T) => void;
}

abstract class BaseRepository<T> implements IRepository<T> {
  abstract find(id: string): T | null;

  save = (entity: T) => {
    // ✅ Property signature → arrow function
    // Base implementation
  };
}

class UserRepository extends BaseRepository<User> {
  find(id: string) {
    // ✅ Abstract method → method
    return this.users.find((u) => u.id === id) || null;
  }
}
```

## License

[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Feavam%2Feslint-plugin-interface-method-style.svg?type=large&issueType=license)](https://app.fossa.com/projects/git%2Bgithub.com%2Feavam%2Feslint-plugin-interface-method-style?ref=badge_large&issueType=license)
