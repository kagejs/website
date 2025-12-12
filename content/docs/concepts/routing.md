---
title: Routing
description: Kage routing system with HTTP methods and dynamic parameters
---

Kage uses a simple, Express-like routing system with support for all HTTP
methods and dynamic parameters.

## HTTP Methods

Kage supports all standard HTTP methods:

```ts
import { Kage } from "jsr:@kage/core";

new Kage()
  .get("/", (c) => c.json({ method: "GET" }))
  .post("/", (c) => c.json({ method: "POST" }))
  .put("/", (c) => c.json({ method: "PUT" }))
  .patch("/", (c) => c.json({ method: "PATCH" }))
  .delete("/", (c) => c.json({ method: "DELETE" }))
  .listen({ port: 8000 });
```

## Route Parameters

Use `:paramName` syntax to capture dynamic segments from the URL:

```ts
import { Kage } from "jsr:@kage/core";

const app = new Kage()
  // Single parameter
  .get("/users/:id", (c) =>
    c.json({
      userId: c.params.id,
      name: `User ${c.params.id}`,
    }))
  // Multiple parameters
  .get("/orgs/:orgId/repos/:repoId", (c) => {
    const { orgId, repoId } = c.params;
    return c.json({
      organization: orgId,
      repository: repoId,
      url: `https://github.com/${orgId}/${repoId}`,
    });
  })
  // Nested parameters
  .get("/api/:version/users/:userId/posts/:postId", (c) =>
    c.json({
      version: c.params.version,
      userId: c.params.userId,
      postId: c.params.postId,
    }))
  .listen({ port: 8000 });
```

## Query Parameters

Access query parameters using `c.query`:

```ts
import { Kage } from "jsr:@kage/core";

new Kage()
  .get("/search", (c) => {
    const query = c.query.get("q");
    const limit = c.query.get("limit") || "10";
    const offset = c.query.get("offset") || "0";

    return c.json({
      query,
      limit: parseInt(limit),
      offset: parseInt(offset),
      results: [],
    });
  })
  .get("/products", (c) => {
    // Get all query parameters
    const params = Object.fromEntries(c.query.entries());

    return c.json({
      filters: params,
      products: [],
    });
  })
  .listen({ port: 8000 });
```

Test it:

```bash
curl "http://localhost:8000/search?q=kage&limit=20&offset=10"
```

## Method Chaining

All route methods return the app instance, allowing fluent chaining:

```ts
const app = new Kage()
  .get("/", (c) => c.text("Home"))
  .get("/about", (c) => c.text("About"))
  .post("/contact", (c) => c.json({ sent: true }))
  .put("/settings", (c) => c.json({ updated: true }))
  .delete("/account", (c) => c.noContent())
  .listen({ port: 8000 });
```

## RESTful Routes

Build RESTful APIs with standard route patterns:

```ts
import { Kage, t } from "jsr:@kage/core";

const app = new Kage()
  // List all users
  .get("/users", (c) =>
    c.json({
      users: [
        { id: 1, name: "Alice" },
        { id: 2, name: "Bob" },
      ],
    }))
  // Get single user
  .get("/users/:id", (c) =>
    c.json({
      id: parseInt(c.params.id),
      name: "Alice",
      email: "alice@example.com",
    }))
  // Create user
  .post(
    "/users",
    {
      body: t.Object({
        name: t.String({ minLength: 1 }),
        email: t.String({ format: "email" }),
      }),
    },
    (c) =>
      c.json(
        {
          created: true,
          user: {
            id: crypto.randomUUID(),
            ...c.body,
          },
        },
        201,
      ),
  )
  // Update user
  .put(
    "/users/:id",
    {
      body: t.Object({
        name: t.Optional(t.String()),
        email: t.Optional(t.String({ format: "email" })),
      }),
    },
    (c) =>
      c.json({
        updated: true,
        user: {
          id: c.params.id,
          ...c.body,
        },
      }),
  )
  // Partial update
  .patch(
    "/users/:id",
    {
      body: t.Object({
        name: t.Optional(t.String()),
      }),
    },
    (c) =>
      c.json({
        updated: true,
        user: {
          id: c.params.id,
          name: c.body.name,
        },
      }),
  )
  // Delete user
  .delete("/users/:id", (c) => c.noContent())
  .listen({ port: 8000 });
```

## Route Matching

Routes are matched in the order they are defined. More specific routes should be
defined before generic ones:

```ts
const app = new Kage()
  // ✅ Specific routes first
  .get("/users/me", (c) => c.json({ currentUser: true }))
  .get("/users/:id", (c) => c.json({ userId: c.params.id }))
  // ❌ Wrong order - /users/me would match /users/:id
  // .get("/users/:id", (c) => c.json({ userId: c.params.id }))
  // .get("/users/me", (c) => c.json({ currentUser: true }))
  .listen({ port: 8000 });
```

Key matching rules:

- Exact matches take priority over parameterized routes
- Parameters (`:param`) match any non-empty segment
- Query strings are not part of route matching
- Routes are matched top-to-bottom

## Nested Resources

Handle nested resources with multiple parameters:

```ts
const app = new Kage()
  // Organization routes
  .get("/orgs/:orgId", (c) =>
    c.json({
      id: c.params.orgId,
      name: `Organization ${c.params.orgId}`,
    }))
  // Organization repositories
  .get("/orgs/:orgId/repos", (c) =>
    c.json({
      orgId: c.params.orgId,
      repos: [],
    }))
  // Specific repository
  .get("/orgs/:orgId/repos/:repoId", (c) =>
    c.json({
      orgId: c.params.orgId,
      repoId: c.params.repoId,
      name: `${c.params.orgId}/${c.params.repoId}`,
    }))
  // Repository issues
  .get("/orgs/:orgId/repos/:repoId/issues", (c) =>
    c.json({
      orgId: c.params.orgId,
      repoId: c.params.repoId,
      issues: [],
    }))
  // Specific issue
  .get("/orgs/:orgId/repos/:repoId/issues/:issueId", (c) =>
    c.json({
      orgId: c.params.orgId,
      repoId: c.params.repoId,
      issueId: c.params.issueId,
    }))
  .listen({ port: 8000 });
```

Test it:

```bash
curl http://localhost:8000/orgs/kage/repos/core/issues/42
```

## Response Shortcuts

Return data directly from handlers for JSON responses:

```ts
const app = new Kage()
  // Implicit JSON response
  .get("/users", () => ({ users: [] }))
  .get("/users/:id", (c) => ({ userId: c.params.id }))
  // Or use explicit helpers
  .get("/text", (c) => c.text("Plain text"))
  .get("/html", (c) => c.html("<h1>Hello</h1>"))
  .delete("/users/:id", (c) => c.noContent())
  .listen({ port: 8000 });
```
