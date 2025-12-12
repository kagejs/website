---
title: Types
description: Schema validation types for request validation
---

Schema validation types for request validation.

```ts
import { t } from "jsr:@kage/core";
```

## Primitive Types

### t.String(options?)

String type with optional constraints.

**Options:**

- `minLength`: number
- `maxLength`: number
- `pattern`: string (regex)
- `format`: "email" | "uuid" | "url"

### t.Number(options?)

Number type (integers and floats).

**Options:**

- `minimum`: number
- `maximum`: number

### t.Integer(options?)

Integer type (whole numbers only).

**Options:**

- `minimum`: number
- `maximum`: number

### t.Boolean()

Boolean type (true or false).

## Composite Types

### t.Object(shape)

Object type with defined shape.

```ts
t.Object({
  name: t.String(),
  age: t.Number(),
});
```

### t.Array(type)

Array of a specific type.

```ts
t.Array(t.String());
```

### t.Optional(type)

Makes a type optional (can be undefined).

```ts
t.Optional(t.String());
```

## String Formats

| Format    | Description         |
| --------- | ------------------- |
| `"email"` | Valid email address |
| `"uuid"`  | UUID v4 format      |
| `"url"`   | Valid URL           |
