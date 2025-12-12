---
title: Schema Validation
description: Built-in request validation with type inference
---

Kage includes a built-in schema validation system powered by TypeBox that
validates requests and provides full TypeScript type inference.

## Body Validation

Define a body schema to validate and type POST/PUT/PATCH request bodies:

```ts
import { Kage, t } from "jsr:@kage/core";

new Kage()
  .post(
    "/users",
    {
      body: t.Object({
        name: t.String({ minLength: 1, maxLength: 100 }),
        email: t.String({ format: "email" }),
        age: t.Optional(t.Integer({ minimum: 0, maximum: 150 })),
        tags: t.Optional(t.Array(t.String())),
      }),
    },
    (ctx) => {
      // ctx.body is fully typed:
      // { name: string, email: string, age?: number, tags?: string[] }
      return ctx.json(
        {
          created: true,
          user: {
            ...ctx.body,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
          },
        },
        201,
      );
    },
  )
  .listen({ port: 8000 });
```

## Query Validation

Validate URL query parameters:

```ts
import { Kage, t } from "jsr:@kage/core";

new Kage()
  .get(
    "/search",
    {
      query: t.Object({
        q: t.String({ minLength: 1 }),
        limit: t.Optional(t.String({ pattern: "^\\d+$" })),
        offset: t.Optional(t.String({ pattern: "^\\d+$" })),
      }),
    },
    (ctx) => {
      const limit = ctx.query.limit ? parseInt(ctx.query.limit) : 10;
      const offset = ctx.query.offset ? parseInt(ctx.query.offset) : 0;

      return ctx.json({
        query: ctx.query.q,
        limit,
        offset,
        results: [],
      });
    },
  )
  .listen({ port: 8000 });
```

## Params Validation

Validate route parameters:

```ts
app.get(
  "/users/:id",
  {
    params: t.Object({
      id: t.String({ format: "uuid" }),
    }),
  },
  (ctx) => {
    // ctx.params.id is validated as UUID
    return ctx.json({
      id: ctx.params.id,
      name: "User",
      email: "user@example.com",
    });
  },
);
```

## Available Types

```ts
// String types
t.String(); // Basic string
t.String({ minLength: 1 }); // Non-empty string
t.String({ maxLength: 100 }); // Max 100 chars
t.String({ format: "email" }); // Email format
t.String({ format: "uuid" }); // UUID format
t.String({ pattern: "^[a-z]+$" }); // Regex pattern

// Number types
t.Number(); // Any number
t.Integer(); // Whole numbers only
t.Number({ minimum: 0 }); // Min value
t.Number({ maximum: 100 }); // Max value

// Boolean
t.Boolean();

// Arrays
t.Array(t.String()); // Array of strings
t.Array(t.Number()); // Array of numbers

// Objects
t.Object({
  key: t.String(),
});

// Optional fields
t.Optional(t.String()); // string | undefined
```

## Error Handling

Invalid requests automatically return a 400 response with details:

```json
{
  "error": "Validation failed",
  "details": [
    { "path": "name", "message": "String must be at least 1 character" },
    { "path": "email", "message": "Invalid email format" }
  ]
}
```
