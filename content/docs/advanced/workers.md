---
title: Workers
description: Offload CPU-intensive tasks with Web Workers
---

Kage provides a simple `worker()` helper that manages Web Worker pools
automatically, making it easy to offload CPU-intensive tasks and keep your
server responsive.

## Basic Usage

The `worker()` function creates a managed worker pool from an inline function:

```ts
import { Kage } from "jsr:@kage/core";
import { worker } from "jsr:@kage/workers";

// Define worker inline - no separate file needed!
const fibonacci = worker(
  (n: number): number => {
    if (n <= 1) return n;
    let a = 0, b = 1;
    for (let i = 2; i <= n; i++) {
      [a, b] = [b, a + b];
    }
    return b;
  },
  { minWorkers: 2, maxWorkers: 4 },
);

const app = new Kage()
  .get("/fibonacci/:n", async (ctx) => {
    const n = parseInt(ctx.params.n, 10);

    // Use worker like a normal async function!
    const result = await fibonacci(n);

    return ctx.json({ n, fibonacci: result });
  })
  .listen({ port: 8000 });
```

Run the server:

```bash
deno run --allow-net main.ts
```

Test it:

```bash
curl http://localhost:8000/fibonacci/40
# { "n": 40, "fibonacci": 102334155 }
```

## Worker Configuration

Configure worker pools with options:

```ts
const heavyTask = worker(
  (data: string) => {
    // CPU-intensive computation
    return data.toUpperCase();
  },
  {
    minWorkers: 2, // Minimum workers to keep alive
    maxWorkers: 8, // Maximum concurrent workers
    name: "heavy-task", // Worker name for debugging
    trackMetrics: true, // Track performance metrics
  },
);
```

## Parallel Processing

Process multiple tasks in parallel using `.map()`:

```ts
import { Kage } from "jsr:@kage/core";
import { worker } from "jsr:@kage/workers";

const countPrimes = worker(
  (n: number): number => {
    if (n < 2) return 0;
    const sieve = new Uint8Array(n + 1);
    let count = 0;
    for (let i = 2; i <= n; i++) {
      if (sieve[i] === 0) {
        count++;
        for (let j = i * 2; j <= n; j += i) {
          sieve[j] = 1;
        }
      }
    }
    return count;
  },
  { minWorkers: 2, maxWorkers: 4 },
);

const app = new Kage()
  .get("/batch", async (ctx) => {
    const inputs = [10, 20, 30, 40, 50];

    // Process all inputs in parallel across worker pool
    const results = await countPrimes.map(inputs);

    return ctx.json({ inputs, results });
  })
  .get("/parallel-heavy", async (ctx) => {
    const start = performance.now();

    // 4 prime calculations running in parallel
    const results = await countPrimes.map([
      100_000,
      100_000,
      100_000,
      100_000,
    ]);

    const elapsed = performance.now() - start;

    return ctx.json({
      results,
      elapsedMs: elapsed.toFixed(2),
      note: "Compare with sequential: would take ~4x longer",
    });
  })
  .listen({ port: 8000 });
```

## Multiple Workers

Create different worker pools for different types of tasks:

```ts
import { Kage } from "jsr:@kage/core";
import { worker } from "jsr:@kage/workers";

// Image processing worker
const processImage = worker(
  (imageData: string) => {
    // Heavy image processing
    return imageData.split("").reverse().join("");
  },
  { minWorkers: 2, maxWorkers: 4, name: "image-processor" },
);

// Data analysis worker
const analyzeData = worker(
  (data: number[]) => {
    const sum = data.reduce((a, b) => a + b, 0);
    const avg = sum / data.length;
    return { sum, avg, count: data.length };
  },
  { minWorkers: 1, maxWorkers: 2, name: "data-analyzer" },
);

const app = new Kage()
  .post("/process-image", async (ctx) => {
    const { image } = ctx.body;
    const result = await processImage(image);
    return ctx.json({ processed: result });
  })
  .post("/analyze", async (ctx) => {
    const { data } = ctx.body;
    const stats = await analyzeData(data);
    return ctx.json(stats);
  })
  .listen({ port: 8000 });
```

## Performance Metrics

Enable metrics tracking to monitor worker performance:

```ts
const fibonacci = worker(
  (n: number): number => {
    // ... computation
  },
  {
    minWorkers: 2,
    maxWorkers: 4,
    trackMetrics: true, // Enable metrics
    name: "fibonacci",
  },
);

// Metrics are automatically tracked internally
// Access via worker pool management (if exposed)
```

## Real-World Example

Complete example with image processing:

```ts
import { Kage, t } from "jsr:@kage/core";
import { worker } from "jsr:@kage/workers";

// Simulate image processing
const processImage = worker(
  (options: { width: number; height: number; filter: string }) => {
    // Simulate CPU-intensive image processing
    let result = 0;
    for (let i = 0; i < options.width * options.height; i++) {
      result += Math.sqrt(i) * Math.random();
    }

    return {
      processed: true,
      dimensions: `${options.width}x${options.height}`,
      filter: options.filter,
      checksum: result.toFixed(2),
    };
  },
  { minWorkers: 2, maxWorkers: 6, name: "image-processor" },
);

const app = new Kage()
  .post(
    "/process-image",
    {
      body: t.Object({
        width: t.Integer({ minimum: 1, maximum: 4096 }),
        height: t.Integer({ minimum: 1, maximum: 4096 }),
        filter: t.String(),
      }),
    },
    async (ctx) => {
      const result = await processImage(ctx.body);
      return ctx.json(result, 201);
    },
  )
  .post(
    "/batch-process",
    {
      body: t.Object({
        images: t.Array(
          t.Object({
            width: t.Integer(),
            height: t.Integer(),
            filter: t.String(),
          }),
        ),
      }),
    },
    async (ctx) => {
      const start = performance.now();

      // Process all images in parallel
      const results = await processImage.map(ctx.body.images);

      const elapsed = performance.now() - start;

      return ctx.json({
        processed: results.length,
        results,
        elapsedMs: elapsed.toFixed(2),
      });
    },
  )
  .listen({ port: 8000 });
```

## Best Practices

- **Pool Size**: Set `minWorkers` based on typical load, `maxWorkers` based on
  CPU cores
- **Task Granularity**: Workers have overhead - use for tasks taking >10ms
- **Data Transfer**: Minimize data passed to workers (uses structured clone)
- **Error Handling**: Worker errors are automatically propagated as Promise
  rejections
- **Metrics**: Enable `trackMetrics` in development to identify bottlenecks

## Benefits Over Manual Workers

The `worker()` helper provides several advantages over manual Web Worker
management:

- **No separate files**: Define workers inline with type safety
- **Automatic pooling**: Worker lifecycle managed automatically
- **Simple API**: Use like async functions with `.map()` for parallel processing
- **Type safe**: Full TypeScript support for inputs and outputs
- **Error handling**: Automatic error propagation and cleanup
