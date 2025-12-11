---
title: Introduction
description: Kage is a type-safe web framework built for Deno
---

Kage is a minimalist yet powerful web framework for Deno. Write APIs with full type safety, built-in validation, and zero hidden abstractions.

> **Early Development:** Kage is in active development and not yet production-ready.

## Simple by Design

Build type-safe APIs with clean, readable code:

```ts
import { Kage, t } from "jsr:@kage/core";

new Kage()
  .post(
    "/users",
    {
      body: t.Object({
        name: t.String({ minLength: 1 }),
        email: t.String({ format: "email" }),
      }),
    },
    (c) => c.json({ created: true, user: c.body }, 201)
  )
  .listen({ port: 8000 });
```

Run with: `deno run --allow-net main.ts`

**What you get:**
- ✅ Request validation with TypeBox
- ✅ Full TypeScript inference for `c.body`
- ✅ Automatic 400 errors on invalid data
- ✅ Zero configuration needed

## Powerful When You Need It

### Extend Context

Add authentication, database clients, or any custom logic using core APIs:

```ts
const app = new Kage()
  // Decorate: immutable singleton values
  .decorate("version", "1.0.0")

  // Derive: computed per request
  .derive((c) => {
    const token = c.headers.get("Authorization");
    return {
      user: token ? parseJWT(token) : null,
      isAuthenticated: !!token,
    };
  })

  // State: shared mutable data
  .state("requestCount", 0)

  .get("/me", (c) => {
    if (!c.isAuthenticated) {
      return c.unauthorized("Login required");
    }
    return c.json({ user: c.user });
  });
```

### Offload Heavy Work to Workers

CPU-intensive tasks run in parallel with the `worker()` helper:

```ts
import { worker } from "jsr:@kage/workers";

const processImage = worker(
  (options: { width: number; height: number }) => {
    // Heavy computation in worker pool
    return processImageData(options);
  },
  { minWorkers: 2, maxWorkers: 4 }
);

app.post("/process", async (c) => {
  const result = await processImage(c.body);
  return c.json(result);
});
```

### Organize with Modular Routers

Keep your codebase clean with router mounting:

```ts
// routes/users.ts
export const usersRouter = new Kage({ prefix: "/users" })
  .get("/", (c) => c.json({ users: [] }))
  .get("/:id", (c) => c.json({ userId: c.params.id }));

// main.ts
const app = new Kage()
  .mount(usersRouter)  // Routes at /users/*
  .mount(postsRouter)  // Routes at /posts/*
  .listen({ port: 8000 });
```

## Core Philosophy

**Kage** (影, meaning "shadow" in Japanese) follows these principles:

1. **Explicit over implicit** - No magic decorators or hidden dependency injection
2. **Type-safe by default** - Full TypeScript inference everywhere
3. **Standards-based** - Built on native Web APIs (Request/Response)
4. **Composable** - Small, focused primitives that combine elegantly

## Key Features

- **Schema Validation** - TypeBox integration with full type inference
- **Context Extensions** - Extend handlers with `decorate`, `derive`, and `state`
- **Plugins** - Composable functions that use context extensions
- **Lifecycle Hooks** - `onRequest`, `onBeforeHandle`, `onAfterHandle`, `onResponse`
- **Worker Pools** - Inline worker functions with automatic pooling
- **Route Groups** - Organize routes with shared middleware and prefixes
- **Status Helpers** - Convenient methods like `unauthorized()`, `forbidden()`, `notFound()`

## Quick Links

- [Quick Start](/docs/quickstart) - Build your first API
- [Routing](/docs/concepts/routing) - HTTP methods, params, and RESTful routes
- [Schema Validation](/docs/concepts/schema) - Type-safe request validation
- [Plugins](/docs/advanced/plugins) - Create reusable extensions with `decorate`, `derive`, `state`
- [Workers](/docs/advanced/workers) - Parallel processing with worker pools
