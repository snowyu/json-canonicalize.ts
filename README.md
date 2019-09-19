# json-canonicalize

> JSON canonicalize function

[![Build Status](https://travis-ci.org/snowyu/json-canonicalize.svg?branch=master)](https://travis-ci.org/snowyu/json-canonicalize)
[![NPM version](https://img.shields.io/npm/v/json-canonicalize.svg)](https://www.npmjs.com/package/json-canonicalize)
![Downloads](https://img.shields.io/npm/dm/json-canonicalize.svg)
[![Standard Version](https://img.shields.io/badge/release-standard%20version-brightgreen.svg)](https://github.com/conventional-changelog/standard-version)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)

---

# JSON Canonicalization

Cryptographic operations like hashing and signing depend on that the target
data does not change during serialization, transport, or parsing.
By applying the rules defined by JCS (JSON Canonicalization Scheme),
data provided in the JSON [[RFC8259](https://tools.ietf.org/html/rfc8259)]
format can be exchanged "as is", while still being subject to secure cryptographic operations.
JCS achieves this by building on the serialization formats for JSON
primitives as defined by ECMAScript [[ES6](https://www.ecma-international.org/ecma-262/6.0/index.html)],
constraining JSON data to the I-JSON [[RFC7493](https://tools.ietf.org/html//rfc7493)] subset,
and through a platform independent property sorting scheme.

- Working document: https://cyberphone.github.io/ietf-json-canon
- Published IETF Draft: https://tools.ietf.org/html/draft-rundgren-json-canonicalization-scheme-05

## ✨ Features

The JSON Canonicalization Scheme concept in a nutshell:

- Serialization of primitive JSON data types using methods compatible with ECMAScript's `JSON.stringify()`
- Lexicographic sorting of JSON `Object` properties in a _recursive_ process
- JSON `Array` data is also subject to canonicalization, _but element order remains untouched_

## 🔧 Installation

```sh
yarn add json-canonicalize
```

## 🎬 Getting started

Let's demonstrate simple usage with ... example:

```ts
import { canonicalize, canonicalizeEx } from 'json-canonicalize';
canonicalize(obj}
// Add `include` and `exclude` options to `canonicalizeEx`.
canonicalizeEx(obj, {exclude:['num', 'dt']}

// add canonicalize to JSON directly.
// which means
// JSON.canonicalize = canonicalize;
import from 'json-canonicalize/src/global';
JSON.canonicalize(obj}
```

## 🥂 License

[MIT](./LICENSE.md) as always

# Refs

- (JSON Canonicalization)[https://github.com/cyberphone/json-canonicalization]
