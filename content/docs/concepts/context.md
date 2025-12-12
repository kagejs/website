---
title: Context
description: The context object passed to route handlers
---

Every route handler receives a context object that provides access to request
data and response helpers.

## Context Properties

The context object provides everything you need to handle a request:

```ts
app.get("/example", (c) => {
  // Request information
  c.request; // Native Request object
  c.params; // Route parameters { id: "123" }
  c.query; // URLSearchParams instance
  c.body; // Parsed request body (with schema)

  // Response helpers
  c.json(data); // JSON response
  c.text(str); // Plain text response
  c.html(str); // HTML response
  c.response(body, init); // Custom response
  c.noContent(); // 204 No Content

  // Store (state)
  c.store; // Access global state

  return c.json({ ok: true });
});
```

## Working with Headers

Access request headers and set response headers:

```ts
import { Kage } from "jsr:@kage/core";

new Kage()
  .get("/headers", (c) => {
    // Read request headers
    const auth = c.request.headers.get("Authorization");

    // Set response headers (via response helper)
    return c.response(
      JSON.stringify({ auth }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "X-Custom-Header": "value",
        },
      },
    );
  })
  .listen({ port: 8000 });
```

## Body Parsing

Request bodies can be parsed with schema validation or manually:

```ts
import { Kage, t } from "jsr:@kage/core";

new Kage()
  // With schema - body is typed and validated
  .post("/users", {
    schemas: {
      body: t.Object({
        name: t.String(),
        email: t.String({ format: "email" }),
      }),
    },
    handler: (c) => c.json(c.body), // c.body: { name: string, email: string }
  })
  // Without schema - parse manually
  .post("/raw", async (c) => {
    const body = await c.request.json();
    return body;
  })
  .listen({ port: 8000 });
```

## Response Methods

| Method                    | Description                             | Status |
| ------------------------- | --------------------------------------- | ------ |
| `c.json(data, status?)`   | Returns JSON with proper Content-Type   | 200    |
| `c.text(str, status?)`    | Returns plain text response             | 200    |
| `c.html(str, status?)`    | Returns HTML response                   | 200    |
| `c.response(body, init?)` | Custom response with status and headers | 200    |
| `c.noContent()`           | Returns 204 No Content                  | 204    |
| `c.unauthorized(message)` | Returns 401 Unauthorized                | 401    |
| `c.forbidden(message)`    | Returns 403 Forbidden                   | 403    |
| `c.notFound(message)`     | Returns 404 Not Found                   | 404    |
| `c.badRequest(message)`   | Returns 400 Bad Request                 | 400    |
| `c.serverError(message)`  | Returns 500 Internal Server Error       | 500    |

## Status Code Helpers

Kage provides convenient helpers for common HTTP status codes:

```ts
import { Kage } from "jsr:@kage/core";

new Kage()
  // 401 Unauthorized
  .get("/protected", (c) => {
    const token = c.headers.get("Authorization");
    if (!token) {
      return c.unauthorized("Authentication required");
    }
    return c.json({ data: "protected" });
  })
  // 403 Forbidden
  .get("/admin", (c) => {
    const isAdmin = false; // Check user role
    if (!isAdmin) {
      return c.forbidden("Admin access required");
    }
    return c.json({ admin: true });
  })
  // 404 Not Found
  .get("/users/:id", (c) => {
    const user = null; // Database lookup
    if (!user) {
      return c.notFound("User not found");
    }
    return c.json(user);
  })
  // 400 Bad Request
  .post("/validate", (c) => {
    if (!c.headers.get("Content-Type")) {
      return c.badRequest("Content-Type header required");
    }
    return c.json({ ok: true });
  })
  // 500 Internal Server Error
  .get("/error", (c) => {
    try {
      throw new Error("Something went wrong");
    } catch (error) {
      return c.serverError("Internal server error");
    }
  })
  .listen({ port: 8000 });
```

## Custom Status Codes

Use `c.json()`, `c.text()`, or `c.response()` with custom status codes:

```ts
new Kage()
  // 201 Created
  .post("/users", (c) =>
    c.json(
      {
        created: true,
        id: crypto.randomUUID(),
      },
      201,
    ))
  // 202 Accepted
  .post("/async-task", (c) =>
    c.json(
      {
        taskId: crypto.randomUUID(),
        status: "queued",
      },
      202,
    ))
  // 304 Not Modified
  .get("/resource", (c) => {
    const etag = c.headers.get("If-None-Match");
    if (etag === "abc123") {
      return c.response(null, { status: 304 });
    }
    return c.json({ data: "content" });
  })
  .listen({ port: 8000 });
```
