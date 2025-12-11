---
title: Plugins
description: Extend Kage with decorators, derived values, and lifecycle hooks
---

Kage provides **core context APIs** to extend your application's functionality. **Plugins** are reusable functions that compose these APIs together.

## Core Context APIs

Kage provides three core APIs to extend the request context:

1. **`decorate`** - Add immutable singleton values available in all handlers
2. **`derive`** - Add computed values calculated per request
3. **`state`** - Add shared mutable state across requests

These APIs can be used directly or composed into reusable **plugins**.

### The Three Pillars

```ts
import { Kage } from "jsr:@kage/core";

const app = new Kage()
  // DECORATE: Static values available everywhere
  .decorate("version", "1.0.0")
  .decorate("config", { apiUrl: "https://api.example.com" })

  // STATE: Shared mutable state
  .state("requestCount", 0)
  .state("activeUsers", new Set<string>())

  // DERIVE: Computed per request
  .derive((c) => {
    const token = c.headers.get("Authorization");
    return {
      user: token ? { id: "123" } : null,
      isAuthenticated: !!token,
    };
  })

  .get("/", (c) => {
    c.store.requestCount++; // Access state

    return c.json({
      version: c.version,           // Access decorator
      config: c.config,              // Access decorator
      requests: c.store.requestCount, // Access state
      user: c.user,                  // Access derived value
      isAuthenticated: c.isAuthenticated, // Access derived value
    });
  })
  .listen({ port: 8000 });
```

## Decorate - Static Values

Use `decorate()` to add **static properties** that are available in all route handlers. These are set once when the app starts and don't change per request.

**When to use:**
- Configuration values (API keys, URLs)
- Database connections
- External service clients
- Static utilities

```ts
import { Kage } from "jsr:@kage/core";

const app = new Kage()
  // Add version information
  .decorate("version", "1.0.0")

  // Add configuration object
  .decorate("config", {
    apiUrl: "https://api.example.com",
    maxRetries: 3,
    timeout: 5000,
  })

  // Add database client
  .decorate("db", {
    query: async (sql: string) => {
      console.log(`Executing: ${sql}`);
      return [];
    },
  })

  // Add logger
  .decorate("logger", {
    info: (msg: string) => console.log(`[INFO] ${msg}`),
    error: (msg: string) => console.error(`[ERROR] ${msg}`),
  })

  .get("/", (c) => {
    c.logger.info("Request received");

    return c.json({
      version: c.version,
      apiUrl: c.config.apiUrl,
    });
  })

  .get("/users", async (c) => {
    const users = await c.db.query("SELECT * FROM users");
    return c.json({ users });
  })

  .listen({ port: 8000 });
```

**Key characteristics:**
- ✅ Set once, available everywhere
- ✅ Type-safe with TypeScript inference
- ✅ Shared across all requests
- ❌ Cannot change per request

## Derive - Computed Values

Use `derive()` to add **computed values** that are calculated for each request. Perfect for authentication, parsing tokens, or any per-request logic.

**When to use:**
- Authentication/authorization
- Parsing headers or cookies
- Computing request-specific data
- Per-request transformations

```ts
import { Kage } from "jsr:@kage/core";

const app = new Kage()
  // Derive authentication info from headers
  .derive((c) => {
    const token = c.headers.get("Authorization");

    if (!token?.startsWith("Bearer ")) {
      return {
        user: null,
        isAuthenticated: false as const,
      };
    }

    // In real app: decode and verify JWT
    const userId = token.slice(7);

    return {
      user: { id: userId, name: `User ${userId}` },
      isAuthenticated: true as const,
    };
  })

  .get("/me", (c) => {
    if (!c.isAuthenticated) {
      return c.unauthorized("Login required");
    }

    return c.json({
      user: c.user, // Typed as { id: string, name: string }
    });
  })

  .listen({ port: 8000 });
```

**Multiple derives:**
```ts
const app = new Kage()
  // First derive: authentication
  .derive((c) => {
    const token = c.headers.get("Authorization");
    return {
      user: token ? { id: "123", role: "admin" } : null,
      isAuthenticated: !!token,
    };
  })

  // Second derive: can use previous derives!
  .derive((c) => {
    return {
      isAdmin: c.user?.role === "admin",
      canEdit: c.isAuthenticated && c.user?.role === "admin",
    };
  })

  .get("/admin", (c) => {
    if (!c.isAdmin) {
      return c.forbidden("Admin access required");
    }

    return c.json({ message: "Welcome, admin!" });
  })

  .listen({ port: 8000 });
```

**Key characteristics:**
- ✅ Calculated per request
- ✅ Can access request headers, params, etc.
- ✅ Type-safe and composable
- ✅ Can use values from previous derives
- ❌ Cannot access route body (runs before validation)

## State - Shared Mutable State

Use `state()` to add **shared mutable state** that persists across requests. Use sparingly - for counters, caches, or in-memory data.

**When to use:**
- Request counters
- In-memory caching
- Rate limiting maps
- Temporary session storage

**When NOT to use:**
- Persistent data (use a database instead)
- Large datasets (memory limited)
- Production session management (use Redis/database)

```ts
import { Kage } from "jsr:@kage/core";

const app = new Kage()
  // Simple counter
  .state("requestCount", 0)

  // Cache with Map
  .state("cache", new Map<string, { data: unknown; expiresAt: number }>())

  // Active connections
  .state("activeUsers", new Set<string>())

  .use((c, next) => {
    c.store.requestCount++;
    return next();
  })

  .get("/stats", (c) =>
    c.json({
      totalRequests: c.store.requestCount,
      cachedItems: c.store.cache.size,
      activeUsers: c.store.activeUsers.size,
    })
  )

  .get("/data/:key", (c) => {
    const { key } = c.params;
    const cached = c.store.cache.get(key);

    // Check cache
    if (cached && cached.expiresAt > Date.now()) {
      return c.json({ data: cached.data, cached: true });
    }

    // Compute and cache
    const data = { computed: true, timestamp: Date.now() };
    c.store.cache.set(key, {
      data,
      expiresAt: Date.now() + 60_000, // 1 minute
    });

    return c.json({ data, cached: false });
  })

  .listen({ port: 8000 });
```

**Key characteristics:**
- ✅ Shared across all requests
- ✅ Mutable (can be modified)
- ✅ Persists in memory during app lifetime
- ⚠️ Lost on server restart
- ⚠️ Not suitable for persistent data
- ⚠️ Race conditions possible (use carefully)

## Decorate vs Derive vs State

| Feature | `decorate()` | `derive()` | `state()` |
|---------|-------------|-----------|----------|
| **Timing** | Set once at startup | Computed per request | Shared across requests |
| **Mutability** | Immutable | Immutable | Mutable |
| **Use case** | Config, DB, services | Auth, parsing, computed | Counters, cache, temp data |
| **Example** | API keys, DB client | User from token | Request counter |
| **Persistence** | App lifetime | Request lifetime | App lifetime |

**Example combining all three:**

```ts
import { Kage, type P } from "jsr:@kage/core";

const app = new Kage()
  // DECORATE: Static app configuration
  .decorate("config", {
    appName: "My API",
    version: "1.0.0",
    maxRequestsPerMinute: 100,
  })

  // STATE: Request counter for rate limiting
  .state("requestCount", 0)
  .state("requestsByIp", new Map<string, number[]>())

  // DERIVE: Compute per-request values
  .derive((c) => {
    const token = c.headers.get("Authorization");
    return {
      user: token ? { id: token.slice(7) } : null,
      isAuthenticated: !!token,
    };
  })

  .use((c, next) => {
    // Use state for counting
    c.store.requestCount++;

    // Use derive for authentication
    const ip = c.headers.get("x-forwarded-for") ?? "unknown";
    const now = Date.now();

    // Rate limiting with state
    const requests = c.store.requestsByIp.get(ip) ?? [];
    const recentRequests = requests.filter((t) => t > now - 60_000);

    if (recentRequests.length >= c.config.maxRequestsPerMinute) {
      return c.json({ error: "Rate limit exceeded" }, 429);
    }

    c.store.requestsByIp.set(ip, [...recentRequests, now]);

    return next();
  })

  .get("/", (c) =>
    c.json({
      // Use decorate
      app: c.config.appName,
      version: c.config.version,
      // Use state
      totalRequests: c.store.requestCount,
      // Use derive
      authenticated: c.isAuthenticated,
      user: c.user,
    })
  )

  .listen({ port: 8000 });
```

## Creating Plugins

A **plugin** is a function that takes a Kage instance and returns a modified version. Plugins use the core context APIs (`decorate`, `derive`, `state`) and lifecycle hooks to add reusable functionality:

```ts
import { Kage, type P } from "jsr:@kage/core";

// Simple plugin with decorate
function versionPlugin<TD extends P, TS extends P, TDR extends P>(
  app: Kage<TD, TS, TDR>
) {
  return app.decorate("version", "1.0.0");
}

// Plugin with derive
function authPlugin<TD extends P, TS extends P, TDR extends P>(
  app: Kage<TD, TS, TDR>
) {
  return app.derive((c) => {
    const token = c.headers.get("Authorization");
    return {
      user: token ? { id: token.slice(7) } : null,
      isAuthenticated: !!token,
    };
  });
}

// Plugin with state
function counterPlugin<TD extends P, TS extends P, TDR extends P>(
  app: Kage<TD, TS, TDR>
) {
  return app.state("requestCount", 0);
}

// Use plugins
const app = new Kage()
  .use(versionPlugin)
  .use(authPlugin)
  .use(counterPlugin)
  .get("/", (c) => {
    return c.json({
      version: c.version,
      authenticated: c.isAuthenticated,
      requests: c.store.requestCount,
    });
  })
  .listen({ port: 8000 });
```

## Lifecycle Hooks

Plugins can hook into request lifecycle events. Kage provides several hooks for different stages of request processing:

- `onRequest(handler)` - Called when request is received, before routing
- `onBeforeHandle(handler)` - Called before route handler executes
- `onAfterHandle(handler)` - Called after route handler completes
- `onResponse(handler)` - Called before sending response to client

### onRequest and onResponse

Use `onRequest` and `onResponse` for request/response logging and timing:

```ts
import { Kage, type P } from "jsr:@kage/core";

function timing<TD extends P, TS extends P, TDR extends P>(
  app: Kage<TD, TS, TDR>
) {
  return app
    .onRequest((_, c) => {
      c.set("startTime", performance.now());
      return null;
    })
    .onResponse((res, _, c) => {
      const start = c.get<number>("startTime") ?? 0;
      const duration = (performance.now() - start).toFixed(2);
      const headers = new Headers(res.headers);

      headers.set("X-Response-Time", `${duration}ms`);

      return new Response(res.body, {
        status: res.status,
        headers,
      });
    });
}

const app = new Kage()
  .use(timing)
  .get("/", (c) => c.json({ message: "Hello" }))
  .listen({ port: 8000 });
```

### onBeforeHandle

Use `onBeforeHandle` to validate or short-circuit requests before handlers run:

```ts
function authGuard<TD extends P, TS extends P, TDR extends P>(
  app: Kage<TD, TS, TDR>
) {
  return app.onBeforeHandle((c) => {
    const token = c.headers.get("Authorization");

    if (!token?.startsWith("Bearer ")) {
      return c.unauthorized("Authentication required");
    }

    // Return undefined to continue to handler
    return undefined;
  });
}
```

### onAfterHandle

Use `onAfterHandle` to modify responses or track metrics:

```ts
function counter(options: { logEvery?: number } = {}) {
  const logEvery = options.logEvery ?? 10;

  return <TD extends P, TS extends P, TDR extends P>(app: Kage<TD, TS, TDR>) =>
    app
      .state("requestCount", 0)
      .onAfterHandle((c, res) => {
        c.store.requestCount++;

        if (c.store.requestCount % logEvery === 0) {
          console.log(`[counter] ${c.store.requestCount} requests processed`);
        }

        return res;
      });
}
```

### Complete Lifecycle Example

Combine multiple hooks in a single plugin:

```ts
import { Kage, type P } from "jsr:@kage/core";

function requestLogger<TD extends P, TS extends P, TDR extends P>(
  app: Kage<TD, TS, TDR>
) {
  return app
    .onRequest((req, c) => {
      const requestId = crypto.randomUUID();
      c.set("requestId", requestId);

      console.log(`[${requestId}] -> ${req.method} ${new URL(req.url).pathname}`);

      return null;
    })
    .onBeforeHandle((c) => {
      const requestId = c.get<string>("requestId");
      console.log(`[${requestId}] Executing handler`);
      return undefined;
    })
    .onAfterHandle((c, res) => {
      const requestId = c.get<string>("requestId");
      console.log(`[${requestId}] Handler completed with status ${res.status}`);
      return res;
    })
    .onResponse((res, _, c) => {
      const requestId = c.get<string>("requestId") ?? "unknown";
      const headers = new Headers(res.headers);
      headers.set("X-Request-ID", requestId);

      console.log(`[${requestId}] <- Response sent`);

      return new Response(res.body, {
        status: res.status,
        headers,
      });
    });
}

const app = new Kage()
  .use(requestLogger)
  .get("/", (c) => c.json({ message: "Hello" }))
  .get("/slow", async (c) => {
    await new Promise((r) => setTimeout(r, 500));
    return c.json({ message: "Slow response" });
  })
  .listen({ port: 8000 });

// Output:
// [abc-123] -> GET /
// [abc-123] Executing handler
// [abc-123] Handler completed with status 200
// [abc-123] <- Response sent
```

## Composing Plugins

Chain multiple plugins together:

```ts
import { Kage, type P } from "jsr:@kage/core";

// Version plugin
function version<TD extends P, TS extends P, TDR extends P>(
  app: Kage<TD, TS, TDR>
) {
  return app.decorate("version", "1.0.0");
}

// Counter plugin with options
function counter(options: { logEvery?: number } = {}) {
  const logEvery = options.logEvery ?? 10;

  return <TD extends P, TS extends P, TDR extends P>(app: Kage<TD, TS, TDR>) =>
    app.state("requestCount", 0).onAfterHandle((c, res) => {
      c.store.requestCount++;

      if (c.store.requestCount % logEvery === 0) {
        console.log(`[counter] ${c.store.requestCount} requests`);
      }

      return res;
    });
}

// Auth plugin
function auth<TD extends P, TS extends P, TDR extends P>(
  app: Kage<TD, TS, TDR>
) {
  return app.derive((c) => {
    const token = c.headers.get("Authorization");

    if (!token?.startsWith("Bearer ")) {
      return { user: null, isAuthenticated: false as const };
    }

    return {
      user: { id: token.slice(7), name: `User ${token.slice(7)}` },
      isAuthenticated: true as const,
    };
  });
}

// Timing plugin
function timing<TD extends P, TS extends P, TDR extends P>(
  app: Kage<TD, TS, TDR>
) {
  return app
    .onRequest((_, c) => {
      c.set("startTime", performance.now());
      return null;
    })
    .onResponse((res, _, c) => {
      const start = c.get<number>("startTime") ?? 0;
      const duration = (performance.now() - start).toFixed(2);
      const headers = new Headers(res.headers);

      headers.set("X-Response-Time", `${duration}ms`);

      return new Response(res.body, {
        status: res.status,
        headers,
      });
    });
}

// Compose all plugins
const app = new Kage()
  .use(version)
  .use(counter({ logEvery: 5 }))
  .use(auth)
  .use(timing)
  .get("/", (c) =>
    c.json({
      version: c.version,
      requests: c.store.requestCount,
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
      .use((g) =>
        g.onBeforeHandle((c) =>
          c.isAuthenticated
            ? undefined
            : c.unauthorized("Authentication required")
        )
      )
      .get("/", (c) => c.json({ message: "Admin panel", user: c.user }))
      .get("/stats", (c) => c.json({ requests: c.store.requestCount }))
  )
  .listen({ port: 8000 });
```

## Plugin Best Practices

- **Type safety**: Use generics `<TD extends P, TS extends P, TDR extends P>` for proper typing
- **Single responsibility**: Each plugin should do one thing well
- **Composability**: Design plugins to work well with others
- **Configuration**: Accept options for flexibility
- **Documentation**: Document what your plugin adds to the context
- **Return types**: Ensure hooks return the correct types (`null`, `undefined`, or `Response`)

## Plugin Patterns

### Authentication Plugin

```ts
function authPlugin<TD extends P, TS extends P, TDR extends P>(
  app: Kage<TD, TS, TDR>
) {
  return app.derive((c) => {
    const token = c.headers.get("Authorization");

    if (!token?.startsWith("Bearer ")) {
      return { user: null, isAuthenticated: false as const };
    }

    // Verify JWT token
    const userId = token.slice(7); // In real app, decode JWT

    return {
      user: { id: userId, name: `User ${userId}` },
      isAuthenticated: true as const,
    };
  });
}
```

### Database Plugin

```ts
function database<TD extends P, TS extends P, TDR extends P>(
  connectionString: string
) {
  return (app: Kage<TD, TS, TDR>) => {
    const db = {
      query: async (sql: string) => {
        console.log(`Executing: ${sql}`);
        return []; // Execute actual query
      },
      close: () => {
        console.log("Database connection closed");
      },
    };

    return app.decorate("db", db);
  };
}

// Usage
const app = new Kage()
  .use(database("postgresql://localhost/mydb"))
  .get("/users", async (c) => {
    const users = await c.db.query("SELECT * FROM users");
    return c.json({ users });
  });
```

### CORS Plugin

```ts
function cors<TD extends P, TS extends P, TDR extends P>(
  app: Kage<TD, TS, TDR>
) {
  return app.onResponse((res) => {
    const headers = new Headers(res.headers);

    headers.set("Access-Control-Allow-Origin", "*");
    headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

    return new Response(res.body, {
      status: res.status,
      headers,
    });
  });
}
```
