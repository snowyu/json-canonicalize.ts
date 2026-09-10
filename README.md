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
- Published RFC 8785: https://www.rfc-editor.org/rfc/rfc8785

## ✨ Features

The JSON Canonicalization Scheme concept in a nutshell:

- Serialization of primitive JSON data types using methods compatible with ECMAScript's `JSON.stringify()`
- Lexicographic sorting of JSON `Object` properties in a _recursive_ process
- JSON `Array` data is also subject to canonicalization, _but element order remains untouched_

## RFC 8785 Compatibility

This implementation is compatible with JCS / RFC 8785 for all data that can actually be represented in JSON, with two enhancements on top:

- **Recursive References:** circular references can be handled (replaced by a `[Circular:$.path]` marker) instead of aborting, which the standard does not cover.
- **Extra filtering:** `canonicalize` drops `undefined` object properties and converts `undefined` array items to `null` (see below).

### A note on `undefined`

`undefined` does not exist in JSON. The JSON data model ([RFC 8259](https://www.rfc-editor.org/rfc/rfc8259#section-1)) defines only object, array, string, number, `true`, `false`, and `null`, and RFC 8785 constrains the input to the I-JSON subset. As a JavaScript value, `undefined` only exists *before* serialization, so the RFC does not — and cannot — define how it should be serialized.

The only observable "reference behavior" is the sample code in [RFC 8785 Appendix A](https://www.rfc-editor.org/rfc/rfc8785#appendix-a), which intentionally skips error handling and blindly leaks `undefined` into its output — e.g. `[1,undefined,3]`, which is invalid, unparseable JSON.

Instead of emitting invalid JSON, the default `canonicalize` follows the ECMAScript `JSON.stringify` conventions — the same conventions RFC 8785 builds on for every other primitive ([§3.2.2](https://www.rfc-editor.org/rfc/rfc8785#section-3.2.2)):

| Input | `canonicalize` | `JSON.stringify` (ES convention) | RFC 8785 App. A sample |
| --- | --- | --- | --- |
| `{ a: 1, b: undefined }` | `{"a":1}` | `{"a":1}` | `{"a":1,"b":undefined}` |
| `[1, undefined, 3]` | `[1,null,3]` | `[1,null,3]` | `[1,undefined,3]` |

- `undefined` **object properties** → dropped (`filterUndefined`)
- `undefined` **array items** → serialized as `null` (`undefinedInArrayToNull`)

For the most RFC 8785-faithful behavior, use `canonicalizeEx` with `strictUndefined: true`: any `undefined` value terminates with an error, just like `NaN`/`Infinity` already do ([§3.2.2.3](https://www.rfc-editor.org/rfc/rfc8785#section-3.2.2.3)). With neither `undefined` option set, `canonicalizeEx` passes values through and reproduces the Appendix A sample output byte-for-byte (invalid `undefined` tokens included), which is mainly useful for testing against the reference implementation.

```ts
canonicalizeEx(obj, { strictUndefined: true }); // throws on any undefined
```

## Non-finite numbers

Per [RFC 8785 §3.2.2.3](https://www.rfc-editor.org/rfc/rfc8785#section-3.2.2.3), `NaN` and `Infinity` are not permitted in JSON: both `canonicalize` and `canonicalizeEx` throw an error when they encounter a non-finite number, instead of silently serializing it as `null`.

Note that this also covers overflowing literals: `JSON.parse('{"v":1e400}')` overflows `1e400` to `Infinity` at parse time (there is no way for the serializer to recover the original literal), so canonicalizing such a document throws as well rather than producing a digest that collides with other overflowing values.

### Intercepting overflow at parse time

Since the overflow happens inside `JSON.parse`, the original literal is already lost by the time a value reaches the serializer. If you want to reject overflowing numbers at the boundary — before they enter your pipeline — parse with a reviver that checks `Number.isFinite`:

```ts
function parseRejectingNonFinite(text: string) {
  return JSON.parse(text, (_key, value) => {
    if (typeof value === 'number' && !Number.isFinite(value)) {
      throw new Error(`Non-finite number (${value}) is not permitted in JSON (RFC 8785 §3.2.2.3)`);
    }
    return value;
  });
}

parseRejectingNonFinite('{"v":1e400}'); // throws: Non-finite number (Infinity) is not permitted in JSON
canonicalize(parseRejectingNonFinite('{"v":1e400}')); // never reaches canonicalize
```

## `canonicalize` vs `canonicalizeEx`

|  | `canonicalize(obj, allowCircular?)` | `canonicalizeEx(obj, options?)` |
| --- | --- | --- |
| Purpose | RFC 8785 + ECMAScript `JSON.stringify` conventions, zero config | Full control over filtering, strictness, and circular handling |
| `undefined` object properties | dropped | kept unless `filterUndefined: true`; error with `strictUndefined: true` |
| `undefined` array items | serialized as `null` | kept unless `undefinedInArrayToNull: true`; error with `strictUndefined: true` |
| Circular references | `allowCircular` parameter | `allowCircular` option |
| `include` / `exclude` filtering | — | ✅ |

### Filtering with `include` / `exclude`

`exclude` accepts a string or an array of property names and applies **recursively at every object level**; `include` is a **root-level whitelist** — missing names are silently skipped, and nested objects are serialized in full:

```ts
import { canonicalize, canonicalizeEx } from 'json-canonicalize'

const obj = {
  text: '你好',
  num: 47734.12,
  dt: new Date('2018-12-17T01:08:19.719Z'),
  arr: [56, 'a', '12', { t: '455A', a: 123 }],
}

// exclude: a string or an array, applied at every nesting level
canonicalizeEx(obj, { exclude: 'num' })
// '{"arr":[56,"a","12",{"a":123,"t":"455A"}],"dt":"2018-12-17T01:08:19.719Z","text":"你好"}'

canonicalizeEx(obj, { exclude: ['num', 'dt'] })
// '{"arr":[56,"a","12",{"a":123,"t":"455A"}],"text":"你好"}'

// include: root-level whitelist, output sorted as always
canonicalizeEx(obj, { include: ['text', 'arr'] })
// '{"arr":[56,"a","12",{"a":123,"t":"455A"}],"text":"你好"}'

// include selects root properties only; nested objects are kept whole
canonicalizeEx({ a: { b: 1, c: 2 } }, { include: ['a'] })
// '{"a":{"b":1,"c":2}}'

// combining both: exclude wins over include
canonicalizeEx({ a: 1, b: 2 }, { include: ['a', 'b'], exclude: 'a' })
// '{"b":2}'
```

Notes:

- While `include` is active, `filterUndefined` is not applied to the whitelisted root properties — an included property with an `undefined` value is emitted (or, with `strictUndefined: true`, throws).
- Properties removed by `exclude` are not validated at all: with `strictUndefined: true`, an `undefined` value hiding under an excluded property does not throw.
- For signing/hashing, prefer plain `canonicalize` — `include`/`exclude` produce non-canonical output by definition, so only use them for view-model or logging purposes.

## 🔧 Installation

```sh
npm add json-canonicalize
```

## 🎬 Getting started

Let's demonstrate simple usage with ... example:

```ts
import { canonicalize, canonicalizeEx } from 'json-canonicalize';
canonicalize(obj)
// Add `include` and `exclude` options to `canonicalizeEx`.
canonicalizeEx(obj, {exclude:['num', 'dt']})

// add canonicalize to JSON directly.
// which means
// JSON.canonicalize = canonicalize;
import from 'json-canonicalize/src/global';
JSON.canonicalize(obj)
```

## API

### `canonicalize(obj, allowCircular)`

This is the main function for JSON canonicalization. It takes a JavaScript object and returns its canonical string representation.

-   `obj` (any): The JavaScript object to canonicalize.
-   `allowCircular` (boolean, optional): If `true`, the function will handle circular references in the object by replacing them with a special identifier (e.g., `[Circular:$.ref]`) that includes the `ref` item's origin, allowing for correct restoration of the object from the string. Defaults to `false`.

### `canonicalizeEx(obj, options)`

This is the extended canonicalization function, offering more granular control over the serialization process.

-   `obj` (any): The JavaScript object to canonicalize.
-   `options` (ISerializeOptions, optional): An object with the following properties. Note that `canonicalizeEx` passes options through to the serializer unmodified — only the options actually present are applied (the default `canonicalize` is the one that enables `filterUndefined` and `undefinedInArrayToNull`):
    -   `allowCircular` (boolean, optional): Same as in `canonicalize`.
    -   `filterUndefined` (boolean, optional): If `true`, `undefined` values in objects will be filtered out.
    -   `undefinedInArrayToNull` (boolean, optional): If `true`, `undefined` values in arrays will be converted to `null`.
    -   `strictUndefined` (boolean, optional): If `true`, any `undefined` value terminates with an error instead (takes precedence over the two options above).
    -   `include` (string[], optional): An array of property names to include in the canonicalization.
    -   `exclude` (string[], optional): An array of property names to exclude from the canonicalization.

## 🥂 License

[MIT](./LICENSE.md) as always

# Refs

- (JSON Canonicalization)[https://github.com/cyberphone/json-canonicalization]
