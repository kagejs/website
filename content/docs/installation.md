---
title: Installation
description: How to install Kage in your Deno project
---

Kage is available on JSR (JavaScript Registry) and can be installed in your Deno
project.

## Prerequisites

- **Deno 2.0+** - Install from [deno.land](https://deno.land)

## Using deno.json

Add Kage to your import map in `deno.json`:

```json
{
  "imports": {
    "@kage/core": "jsr:@kage/core"
  }
}
```

## Direct Import

Or import directly in your TypeScript files:

```ts
import { Kage } from "jsr:@kage/core";
```

## Verify Installation

Create a simple server to verify everything works:

```ts
import { Kage } from "jsr:@kage/core";

new Kage()
  .get("/", (c) => c.json({ status: "ok" }))
  .listen({
    port: 8000,
    onListen: ({ hostname, port }) => {
      console.log(`Server running on http://${hostname}:${port}`);
    },
  });
```

Run the server:

```bash
deno run --allow-net main.ts
```

Visit `http://localhost:8000` to see your server running.
