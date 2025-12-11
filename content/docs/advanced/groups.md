---
title: Route Groups
description: Organize routes with shared configuration and middleware
---

Route groups allow you to organize routes with shared configuration, middleware, and path prefixes.

## Basic Groups

Use `.group()` to create a route group with a shared prefix:

```ts
import { Kage } from "jsr:@kage/core";

const app = new Kage()
  .get("/", (c) => c.json({ message: "Home" }))
  .group("/api", (group) =>
    group
      .get("/users", (c) => c.json({ users: [] }))
      .get("/posts", (c) => c.json({ posts: [] }))
      .get("/comments", (c) => c.json({ comments: [] }))
  )
  .listen({ port: 8000 });

// Routes:
// GET /
// GET /api/users
// GET /api/posts
// GET /api/comments
```

## Groups with Middleware

Apply middleware only to routes within a group:

```ts
import { Kage } from "jsr:@kage/core";

const app = new Kage()
  .get("/", (c) => c.json({ message: "Public" }))
  .group("/admin", (group) =>
    group
      // Middleware only for /admin routes
      .use((g) =>
        g.onBeforeHandle((c) => {
          const token = c.headers.get("Authorization");
          if (!token) {
            return c.unauthorized("Authentication required");
          }
          return undefined; // Continue to handler
        })
      )
      .get("/", (c) => c.json({ message: "Admin panel" }))
      .get("/users", (c) => c.json({ users: [] }))
      .get("/settings", (c) => c.json({ settings: {} }))
  )
  .listen({ port: 8000 });

// Routes:
// GET /           - No auth required
// GET /admin/     - Auth required
// GET /admin/users - Auth required
// GET /admin/settings - Auth required
```

## Groups with Derived Values

Add derived values specific to a group:

```ts
import { Kage } from "jsr:@kage/core";

const app = new Kage()
  .get("/", (c) => c.json({ message: "Home" }))
  .group("/api", (group) =>
    group
      // Add API version to all routes in this group
      .derive(() => ({ apiVersion: "v1" }))
      .get("/info", (c) =>
        c.json({
          version: c.apiVersion,
          endpoints: ["/api/info", "/api/status"],
        })
      )
      .get("/status", (c) =>
        c.json({
          version: c.apiVersion,
          status: "ok",
        })
      )
  )
  .listen({ port: 8000 });
```

## Nested Groups

Create nested groups for complex route hierarchies:

```ts
import { Kage } from "jsr:@kage/core";

const app = new Kage()
  .group("/api", (api) =>
    api
      .get("/", (c) => c.json({ message: "API Home" }))
      .group("/v1", (v1) =>
        v1
          .get("/users", (c) => c.json({ users: [], version: "v1" }))
          .get("/posts", (c) => c.json({ posts: [], version: "v1" }))
      )
      .group("/v2", (v2) =>
        v2
          .get("/users", (c) => c.json({ users: [], version: "v2" }))
          .get("/posts", (c) => c.json({ posts: [], version: "v2" }))
      )
  )
  .listen({ port: 8000 });

// Routes:
// GET /api/
// GET /api/v1/users
// GET /api/v1/posts
// GET /api/v2/users
// GET /api/v2/posts
```

## Authentication Example

Complete example with authentication middleware in a group:

```ts
import { Kage } from "jsr:@kage/core";

// Main app with authentication plugin
const app = new Kage()
  .derive((c) => {
    const token = c.headers.get("Authorization");

    if (!token?.startsWith("Bearer ")) {
      return { user: null, isAuthenticated: false as const };
    }

    // In real app, verify JWT token here
    return {
      user: { id: token.slice(7), name: `User ${token.slice(7)}` },
      isAuthenticated: true as const,
    };
  })
  .get("/", (c) =>
    c.json({
      message: "Welcome!",
      authenticated: c.isAuthenticated,
    })
  )
  .get("/me", (c) =>
    c.json({
      authenticated: c.isAuthenticated,
      user: c.user,
    })
  )
  .group("/admin", (group) =>
    group
      // Require authentication for all /admin routes
      .use((g) =>
        g.onBeforeHandle((c) => {
          if (!c.isAuthenticated) {
            return c.unauthorized("Authentication required");
          }
          return undefined;
        })
      )
      .get("/", (c) =>
        c.json({
          message: "Admin panel",
          user: c.user,
        })
      )
      .get("/stats", (c) =>
        c.json({
          message: "Statistics",
          user: c.user,
          stats: { requests: 100 },
        })
      )
  )
  .listen({ port: 8000 });
```

Test the authentication:

```bash
# Public routes - no auth needed
curl http://localhost:8000/
curl http://localhost:8000/me

# Admin routes - auth required
curl http://localhost:8000/admin/
# Returns: 401 Unauthorized

curl -H "Authorization: Bearer user123" http://localhost:8000/admin/
# Returns: 200 OK with user data
```

## Real-World API Structure

Organize a real-world API with multiple groups:

```ts
import { Kage, t } from "jsr:@kage/core";

const app = new Kage()
  .state("requestCount", 0)
  .use((c, next) => {
    c.store.requestCount++;
    return next();
  })
  .get("/", (c) =>
    c.json({
      message: "API Gateway",
      version: "1.0.0",
    })
  )
  .group("/auth", (auth) =>
    auth
      .post(
        "/login",
        {
          body: t.Object({
            email: t.String({ format: "email" }),
            password: t.String({ minLength: 8 }),
          }),
        },
        (c) =>
          c.json({
            success: true,
            token: "jwt-token-here",
          })
      )
      .post("/logout", (c) => c.json({ success: true }))
      .post("/refresh", (c) => c.json({ token: "new-jwt-token" }))
  )
  .group("/api", (api) =>
    api
      .derive(() => ({ apiVersion: "v1" }))
      .get("/status", (c) =>
        c.json({
          status: "ok",
          version: c.apiVersion,
          requests: c.store.requestCount,
        })
      )
      .group("/users", (users) =>
        users
          .get("/", (c) => c.json({ users: [] }))
          .get("/:id", (c) => c.json({ userId: c.params.id }))
          .post("/", (c) => c.json({ created: true }, 201))
          .delete("/:id", (c) => c.noContent())
      )
      .group("/posts", (posts) =>
        posts
          .get("/", (c) => c.json({ posts: [] }))
          .get("/:id", (c) => c.json({ postId: c.params.id }))
      )
  )
  .listen({ port: 8000 });

// Routes:
// GET    /
// POST   /auth/login
// POST   /auth/logout
// POST   /auth/refresh
// GET    /api/status
// GET    /api/users/
// GET    /api/users/:id
// POST   /api/users/
// DELETE /api/users/:id
// GET    /api/posts/
// GET    /api/posts/:id
```

## Groups vs Mounting

Groups and mounting serve different purposes:

**Use Groups when:**
- You want to apply middleware to specific routes
- Routes share configuration but are part of the same logical app
- You need nested prefixes with shared context

**Use Mounting when:**
- You want complete module separation
- Routes are defined in separate files
- You're building a microservice-like architecture

Example combining both:

```ts
import { Kage } from "jsr:@kage/core";

// Separate router module (could be in separate file)
const usersRouter = new Kage()
  .get("/", (c) => c.json({ users: [] }))
  .get("/:id", (c) => c.json({ userId: c.params.id }));

// Main app
const app = new Kage()
  // Mount separate router
  .mount("/api/users", usersRouter)
  // Use group for inline routes with shared config
  .group("/api/posts", (posts) =>
    posts
      .use((g) =>
        g.derive(() => ({ cached: true }))
      )
      .get("/", (c) => c.json({ posts: [], cached: c.cached }))
      .get("/:id", (c) => c.json({ postId: c.params.id, cached: c.cached }))
  )
  .listen({ port: 8000 });
```

## Best Practices

- **Use groups** for routes that share middleware or configuration
- **Keep nesting shallow** - avoid deeply nested groups (max 2-3 levels)
- **Name groups clearly** - use descriptive prefixes like `/admin`, `/api`, `/auth`
- **Apply auth at group level** - don't repeat authentication logic in every route
- **Combine with mounting** - use mounting for file separation, groups for shared config
