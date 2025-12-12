---
title: Context
description: The context object passed to route handlers and middleware
---

The context object passed to route handlers and middleware.

## Request Properties

### ctx.request

The native Request object.

**Type:** `Request`

### ctx.params

Route parameters extracted from the URL path.

**Type:** `Record<string, string>`

### ctx.query

URL search parameters.

**Type:** `URLSearchParams`

### ctx.body

Parsed and validated request body (when schema is defined).

**Type:** Inferred from schema

## State

### ctx.store

Access to application state defined with .state().

**Type:** Store (defined by state calls)

## Response Methods

### ctx.json(data)

Returns a JSON response with Content-Type: application/json.

```ts
return ctx.json({ message: "Hello" });
```

### ctx.text(str)

Returns a plain text response.

```ts
return ctx.text("Hello, World!");
```

### ctx.html(str)

Returns an HTML response with Content-Type: text/html.

```ts
return ctx.html("<h1>Hello</h1>");
```

### ctx.response(body, init)

Returns a custom Response with specified status and headers.

```ts
return ctx.response(data, {
  status: 201,
  headers: { "X-Custom": "value" },
});
```

### ctx.noContent()

Returns a 204 No Content response.

```ts
return ctx.noContent();
```
