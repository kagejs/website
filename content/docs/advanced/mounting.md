---
title: Mounting Routers
description: Organize your application with modular routers
---

Mount separate router instances to organize your application into modular,
maintainable pieces.

## Basic Mounting

Use `mount(prefix, router)` to attach routers at a URL prefix:

```ts
import { Kage } from "jsr:@kage/core";

// Create separate routers
const usersRouter = new Kage()
  .get("/", (ctx) => ctx.json({ users: [] }))
  .get("/:id", (ctx) => ctx.json({ id: ctx.params.id }))
  .post("/", (ctx) => ctx.json({ created: true }));

const postsRouter = new Kage()
  .get("/", (ctx) => ctx.json({ posts: [] }))
  .get("/:id", (ctx) => ctx.json({ id: ctx.params.id }));

// Mount routers on main app
const app = new Kage()
  .mount("/api/users", usersRouter)
  .mount("/api/posts", postsRouter)
  .listen(8000);

// Routes:
// GET  /api/users
// GET  /api/users/:id
// POST /api/users
// GET  /api/posts
// GET  /api/posts/:id
```

## Router with Prefix

You can define a prefix directly when creating a router using the `prefix`
option:

```ts
import { Kage } from "jsr:@kage/core";

// Create router with built-in prefix
const usersRouter = new Kage({ prefix: "/users" })
  .get("/", (c) => c.json({ users: [] }))
  .get("/:id", (c) => c.json({ userId: c.params.id }))
  .post("/", (c) => c.json({ created: true }));

const postsRouter = new Kage({ prefix: "/posts" })
  .get("/", (c) => c.json({ posts: [] }))
  .get("/:id", (c) => c.json({ postId: c.params.id }));

// Mount routers - prefix is already included
const app = new Kage()
  .mount(usersRouter) // Routes will be at /users/*
  .mount(postsRouter) // Routes will be at /posts/*
  .listen({ port: 8000 });

// Routes:
// GET  /users
// GET  /users/:id
// POST /users
// GET  /posts
// GET  /posts/:id
```

### Prefix vs Mount Prefix

You can combine both approaches:

```ts
// Router with prefix
const authRouter = new Kage({ prefix: "/auth" })
  .get("/login", (c) => c.json({ form: "login" }))
  .post("/login", (c) => c.json({ token: "jwt" }))
  .get("/me", (c) => c.json({ user: {} }));

// Option 1: Mount with router's prefix
const app1 = new Kage()
  .mount(authRouter)
  .listen({ port: 8000 });
// Routes: /auth/login, /auth/me

// Option 2: Override with mount prefix
const app2 = new Kage()
  .mount("/api", authRouter)
  .listen({ port: 8000 });
// Routes: /api/auth/login, /api/auth/me (prefixes combine)

// Option 3: Mount at root to use only router prefix
const app3 = new Kage()
  .mount("/", authRouter)
  .listen({ port: 8000 });
// Routes: /auth/login, /auth/me
```

**When to use `prefix` option:**

- When the router has a natural prefix that always applies
- For self-contained modules (e.g., auth, users, posts)
- When you want the router to be independently testable with its routes

**When to use `mount()` prefix:**

- When mounting external/third-party routers
- For flexible API versioning (`/api/v1`, `/api/v2`)
- When you want to change the prefix without modifying the router

## Shared State

Mounted routers can access state and decorators from the parent app:

```ts
// Main app with shared state
const app = new Kage()
  .state("requestCount", 0)
  .decorate("db", {/* database connection */});

// Router can access shared state via context
const apiRouter = new Kage()
  .get("/stats", (ctx) => {
    return ctx.json({
      requests: ctx.store.requestCount,
    });
  });

app
  .use((ctx, next) => {
    ctx.store.requestCount++;
    return next();
  })
  .mount("/api", apiRouter)
  .listen(8000);
```

## Modular Structure

Organize routes into separate files for larger applications:

```ts
// routes/users.ts
import { Kage } from "jsr:@kage/core";

export const usersRouter = new Kage({ prefix: "/users" })
  .get("/", (c) => c.json({ users: [] }))
  .get("/:id", (c) => c.json({ userId: c.params.id }))
  .post("/", (c) => c.json({ created: true }))
  .delete("/:id", (c) => c.noContent());
```

```ts
// routes/posts.ts
import { Kage } from "jsr:@kage/core";

export const postsRouter = new Kage({ prefix: "/posts" })
  .get("/", (c) => c.json({ posts: [] }))
  .get("/:id", (c) => c.json({ postId: c.params.id }));
```

```ts
// routes/auth.ts
import { Kage } from "jsr:@kage/core";

export const authRouter = new Kage({ prefix: "/auth" })
  .get("/login", (c) => c.json({ form: "login" }))
  .post("/login", (c) => c.json({ token: "jwt" }));
```

```ts
// main.ts
import { Kage } from "jsr:@kage/core";
import { usersRouter } from "./routes/users.ts";
import { postsRouter } from "./routes/posts.ts";
import { authRouter } from "./routes/auth.ts";

const app = new Kage()
  // Mount routers with their built-in prefixes
  .mount(usersRouter) // Routes at /users/*
  .mount(postsRouter) // Routes at /posts/*
  .mount(authRouter) // Routes at /auth/*
  .listen({ port: 8000 });

// Or mount under a common prefix like /api
const apiApp = new Kage()
  .mount("/api", usersRouter) // Routes at /api/users/*
  .mount("/api", postsRouter) // Routes at /api/posts/*
  .mount(authRouter) // Routes at /auth/* (no /api prefix)
  .listen({ port: 8000 });
```

## Nested Mounting

Mount routers within routers for API versioning:

```ts
const v1Router = new Kage()
  .mount("/users", usersRouter)
  .mount("/posts", postsRouter);

const v2Router = new Kage()
  .mount("/users", usersRouterV2)
  .mount("/posts", postsRouterV2);

const app = new Kage()
  .mount("/api/v1", v1Router)
  .mount("/api/v2", v2Router)
  .listen(8000);
```
