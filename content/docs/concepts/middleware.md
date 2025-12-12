---
title: Middleware
description: Intercept requests with middleware functions
---

Middleware functions intercept requests before they reach route handlers,
allowing you to add logging, authentication, rate limiting, and more.

## What is Middleware?

Middleware in Kage are functions that receive a context and a `next` function,
and return a Response. They follow a simple contract:

```ts
type Middleware = (
  context: Context,
  next: () => Promise<Response>,
) => Promise<Response>;
```

**Key characteristics:**

- **Async-first**: Full support for asynchronous operations via Promises
- **Composable**: Multiple middleware can be chained together
- **Flexible**: Can mutate responses or create new ones
- **Interceptors**: Can short-circuit the request by not calling `next()`

## Basic Middleware

Use `app.use()` to register middleware:

```ts
import { Kage } from "jsr:@kage/core";

new Kage()
  // Middleware runs before route handlers
  .use(async (c, next) => {
    console.log(
      `[${new Date().toISOString()}] ${c.request.method} ${c.request.url}`,
    );
    return await next();
  })
  .get("/", (c) => c.json({ ok: true }))
  .listen({ port: 8000 });
```

## Common Patterns

### Request ID

```ts
import { Kage, type Middleware } from "jsr:@kage/core";

function requestId(): Middleware {
  return async (_, next) => {
    const id = crypto.randomUUID();
    const response = await next();
    response.headers.set("X-Request-ID", id);
    return response;
  };
}

new Kage()
  .use(requestId())
  .get("/", (c) => c.json({ ok: true }))
  .listen({ port: 8000 });
```

### Response Timing

```ts
function timing(): Middleware {
  return async (_, next) => {
    const start = performance.now();
    const response = await next();
    const duration = (performance.now() - start).toFixed(2);
    response.headers.set("X-Response-Time", `${duration}ms`);
    return response;
  };
}

new Kage()
  .use(timing())
  .get("/", (c) => c.json({ ok: true }))
  .listen({ port: 8000 });
```

### Rate Limiting

```ts
function rateLimit(limit: number, windowMs: number): Middleware {
  const requests = new Map<string, { count: number; resetAt: number }>();

  return async (c, next) => {
    const ip = c.headers.get("x-forwarded-for") ?? "unknown";
    const now = Date.now();
    const record = requests.get(ip);

    if (!record || now > record.resetAt) {
      requests.set(ip, { count: 1, resetAt: now + windowMs });
    } else if (record.count >= limit) {
      return c.json({ error: "Too many requests" }, 429);
    } else {
      record.count++;
    }

    return await next();
  };
}

new Kage()
  .use(rateLimit(100, 60_000)) // 100 requests per minute
  .get("/", (c) => c.json({ ok: true }))
  .listen({ port: 8000 });
```

### Logging

```ts
function logger(): Middleware {
  return async (c, next) => {
    const start = Date.now();
    const { method, url } = c.request;

    console.log(`--> ${method} ${url}`);

    const response = await next();
    const duration = Date.now() - start;

    console.log(`<-- ${method} ${url} ${response.status} ${duration}ms`);

    return response;
  };
}

new Kage()
  .use(logger())
  .get("/", (c) => c.json({ ok: true }))
  .listen({ port: 8000 });
```

## Execution Order

Middleware executes in the order it's defined, wrapping around the handler like
layers of an onion:

```ts
new Kage()
  // 1. First middleware (outermost)
  .use(async (c, next) => {
    console.log("1. Before");
    const response = await next();
    console.log("1. After");
    return response;
  })
  // 2. Second middleware
  .use(async (c, next) => {
    console.log("2. Before");
    const response = await next();
    console.log("2. After");
    return response;
  })
  // 3. Route handler (innermost)
  .get("/", (c) => {
    console.log("3. Handler");
    return c.json({ ok: true });
  })
  .listen({ port: 8000 });

// Output order:
//  1. Before
//  2. Before
//  3. Handler
//  2. After
//  1. After
```

> **Note:** Always call `await next()` to continue the middleware chain, unless
> you want to short-circuit the request.

## Modifying Responses

Kage middleware can modify responses in two ways: **mutation** or **immutable
creation**.

### Mutation (Recommended)

The simplest approach is to mutate the response directly:

```ts
import { Kage, type Middleware } from "jsr:@kage/core";

function requestId(): Middleware {
  return async (_, next) => {
    const id = crypto.randomUUID();
    const response = await next();
    // Directly mutate the response headers
    response.headers.set("X-Request-ID", id);
    return response;
  };
}

function timing(): Middleware {
  return async (_, next) => {
    const start = performance.now();
    const response = await next();
    const duration = (performance.now() - start).toFixed(2);
    // Mutate headers
    response.headers.set("X-Response-Time", `${duration}ms`);
    return response;
  };
}

new Kage()
  .use(requestId())
  .use(timing())
  .get("/", (c) => c.json({ message: "Hello" }))
  .listen({ port: 8000 });
```

This is the **recommended approach** - it's simpler, more performant.

### Immutable Creation (Alternative)

If you prefer immutability, you can create new Response objects:

```ts
function requestId(): Middleware {
  return async (_, next) => {
    const id = crypto.randomUUID();
    const response = await next();

    // Create new Headers object
    const headers = new Headers(response.headers);
    headers.set("X-Request-ID", id);

    // Return new Response
    return new Response(response.body, {
      status: response.status,
      headers,
    });
  };
}
```

This approach is more verbose but guarantees immutability if that's important
for your use case.

### State Management in Middleware

Middleware can maintain state for cross-request tracking:

```ts
import { Kage, type Middleware } from "jsr:@kage/core";

// Rate limiter with internal state
function rateLimit(limit: number, windowMs: number): Middleware {
  const requests = new Map<string, { count: number; resetAt: number }>();

  return async (c, next) => {
    const ip = c.headers.get("x-forwarded-for") ?? "unknown";
    const now = Date.now();
    const record = requests.get(ip);

    if (!record || now > record.resetAt) {
      requests.set(ip, { count: 1, resetAt: now + windowMs });
    } else if (record.count >= limit) {
      return c.json({ error: "Too many requests" }, 429);
    } else {
      record.count++;
    }

    return await next();
  };
}

// Usage
new Kage()
  .use(rateLimit(100, 60_000)) // 100 requests per minute
  .get("/", (c) => c.json({ ok: true }))
  .listen({ port: 8000 });
```

You can also use **app state** for shared data:

```ts
const app = new Kage()
  .state("requestCount", 0)
  .use(async (c, next) => {
    c.store.requestCount++;
    const response = await next();
    return response;
  })
  .get("/stats", (c) =>
    c.json({
      requests: c.store.requestCount,
    }))
  .listen({ port: 8000 });
```

## Short-Circuiting Requests

Middleware can stop the request chain by not calling `next()`:

```ts
import { Kage } from "jsr:@kage/core";

// Authentication middleware
function authGuard(): Middleware {
  return async (c, next) => {
    const token = c.headers.get("Authorization");

    if (!token) {
      // Short-circuit: don't call next()
      return c.unauthorized("Authentication required");
    }

    // Token exists, continue to next middleware/handler
    return await next();
  };
}

new Kage()
  .use(authGuard())
  .get("/protected", (c) => c.json({ secret: "data" }))
  .listen({ port: 8000 });
```

## Middleware vs Plugins

**Use middleware when** you need to:

- Transform requests/responses for specific routes
- Short-circuit requests (auth guards, rate limiting)
- Add headers or modify responses
- Perform side effects (logging, metrics)

**Use plugins when** you need to:

- Add new properties to context (`decorate`)
- Add computed values per request (`derive`)
- Add shared state across requests (`state`)
- Hook into request lifecycle events

See [Plugins](/docs/advanced/plugins) for more details on extending Kage's
functionality.
