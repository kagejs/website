---
title: State Management
description: Share data across requests with Kage state
---

Kage provides a simple state management system for sharing data across requests.

## Defining State

Use `state(key, value)` to define shared state:

```ts
import { Kage } from "jsr:@kage/core";

const app = new Kage()
  .state("counter", 0)
  .state("users", new Map<string, { name: string }>())
  .get("/counter", (ctx) => {
    return ctx.json({ count: ctx.store.counter });
  })
  .post("/counter/increment", (ctx) => {
    ctx.store.counter++;
    return ctx.json({ count: ctx.store.counter });
  })
  .listen(8000);
```

## Typed State

Define state types for full TypeScript support:

```ts
interface AppState {
  counter: number;
  cache: Map<string, unknown>;
  config: {
    apiKey: string;
    maxConnections: number;
  };
}

const app = new Kage<{}, AppState>()
  .state("counter", 0)
  .state("cache", new Map())
  .state("config", {
    apiKey: Deno.env.get("API_KEY") || "",
    maxConnections: 10,
  })
  .get("/config", (ctx) => {
    // ctx.store is fully typed
    return ctx.json({
      maxConnections: ctx.store.config.maxConnections,
    });
  });
```

## State in Plugins

Plugins can define and use state with lifecycle hooks:

```ts
function counterPlugin(app: Kage) {
  return app
    .state("requestCount", 0)
    .onAfterHandle((ctx, response) => {
      ctx.store.requestCount++;
      return response;
    });
}

const app = new Kage()
  .use(counterPlugin)
  .get("/stats", (ctx) => {
    return ctx.json({
      totalRequests: ctx.store.requestCount,
    });
  });
```

## Caching Example

A practical example using state for caching:

```ts
const app = new Kage()
  .state("cache", new Map<string, { data: unknown; expiresAt: number }>())
  .get("/data/:key", async (ctx) => {
    const { key } = ctx.params;
    const cached = ctx.store.cache.get(key);

    // Return cached data if not expired
    if (cached && cached.expiresAt > Date.now()) {
      return ctx.json({ data: cached.data, cached: true });
    }

    // Fetch fresh data
    const data = await fetchData(key);

    // Cache for 5 minutes
    ctx.store.cache.set(key, {
      data,
      expiresAt: Date.now() + 5 * 60 * 1000,
    });

    return ctx.json({ data, cached: false });
  });
```

> **Note:** State is stored in memory and will be lost on server restart. For
> persistent storage, use a database.
