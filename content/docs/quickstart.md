---
title: Quick Start
description: Learn the basics of Kage by building a simple API server
---

Learn the basics of Kage by building a simple API server.

## Basic Server

Create a new file `main.ts` and set up your first Kage server with routes:

```ts
import { Kage } from "jsr:@kage/core";

new Kage()
  .get("/", (c) => c.json({ message: "Welcome to Kage!" }))
  .get("/users/:id", (c) =>
    c.json({
      userId: c.params.id,
      name: `User ${c.params.id}`
    })
  )
  .get("/orgs/:orgId/repos/:repoId", (c) =>
    c.json({
      organization: c.params.orgId,
      repository: c.params.repoId,
    })
  )
  .post("/users", (c) =>
    c.json({
      created: true,
      id: crypto.randomUUID()
    })
  )
  .delete("/users/:id", (c) => c.noContent())
  .listen({
    port: 8000,
    onListen: ({ hostname, port }) => {
      console.log(`Server running on http://${hostname}:${port}`);
    }
  });
```

Run the server:

```bash
deno run --allow-net main.ts
```

Visit `http://localhost:8000` to see your server running!

## Request Validation

Kage includes a built-in schema validation system powered by TypeBox. Define your schemas and get full type inference:

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
    (c) => {
      // c.body is fully typed!
      const { name, email, age, tags } = c.body;
      return c.json(
        {
          created: true,
          user: {
            id: crypto.randomUUID(),
            name,
            email,
            age,
            tags,
            createdAt: new Date().toISOString(),
          },
        },
        201
      );
    }
  )
  .listen({ port: 8000 });
```

Invalid requests are automatically rejected with a 400 response:

```json
{
  "error": "Validation failed",
  "details": [
    {
      "path": "email",
      "message": "Expected string to match 'email' format"
    }
  ]
}
```

## Query and Params Validation

Validate query parameters and route params too:

```ts
new Kage()
  .get(
    "/search",
    {
      query: t.Object({
        q: t.String({ minLength: 1 }),
        limit: t.Optional(t.String({ pattern: "^\\d+$" })),
      }),
    },
    (c) => {
      const limit = c.query.limit ? parseInt(c.query.limit) : 10;
      return c.json({
        query: c.query.q,
        limit,
        results: [],
      });
    }
  )
  .get(
    "/users/:id",
    {
      params: t.Object({
        id: t.String({ format: "uuid" }),
      }),
    },
    (c) => c.json({ userId: c.params.id })
  );
```

## Middleware

Add middleware to process requests before they reach your handlers:

```ts
import { Kage, type Middleware } from "jsr:@kage/core";

// Request ID middleware
function requestId(): Middleware {
  return async (_, next) => {
    const id = crypto.randomUUID();
    const response = await next();
    response.headers.set("X-Request-ID", id);
    return response;
  };
}

// Response timing middleware
function timing(): Middleware {
  return async (_, next) => {
    const start = performance.now();
    const response = await next();
    const duration = (performance.now() - start).toFixed(2);
    response.headers.set("X-Response-Time", `${duration}ms`);
    return response;
  };
}

const app = new Kage()
  .use(requestId())
  .use(timing())
  .get("/", (c) => c.json({ message: "Hello!" }))
  .listen({ port: 8000 });
```

## Response Helpers

Kage provides convenient response helper methods:

```ts
new Kage()
  // JSON response
  .get("/json", (c) => c.json({ message: "Hello" }))

  // JSON with custom status code
  .post("/created", (c) => c.json({ id: 1 }, 201))

  // Plain text
  .get("/text", (c) => c.text("Plain text response"))

  // HTML content
  .get("/html", (c) => c.html("<h1>Hello World</h1>"))

  // Custom response with headers
  .get("/custom", (c) =>
    c.response("Custom response", {
      status: 201,
      headers: { "X-Custom-Header": "value" },
    })
  )

  // 204 No Content
  .delete("/users/:id", (c) => c.noContent())

  // Status code helpers
  .get("/unauthorized", (c) => c.unauthorized("Login required"))
  .get("/forbidden", (c) => c.forbidden("Access denied"))
  .get("/not-found", (c) => c.notFound("Resource not found"))
  .listen({ port: 8000 });
```

## Next Steps

Now that you know the basics, explore these advanced features:

- [Routing](/docs/concepts/routing) - Dynamic routes and route matching
- [Middleware](/docs/concepts/middleware) - Composable middleware patterns
- [Schema Validation](/docs/concepts/schema) - Complete validation guide
- [Plugins](/docs/advanced/plugins) - Extend Kage with decorators and lifecycle hooks
- [Router Mounting](/docs/advanced/mounting) - Organize code with modular routers
- [Workers](/docs/advanced/workers) - Offload CPU-intensive tasks
