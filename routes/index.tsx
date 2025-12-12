import { define } from "../utils.ts";
import CodeHighlight from "../islands/CodeHighlight.tsx";

const heroCode = `import { Kage, t } from "jsr:@kage/core";

new Kage()
  .post("/users", {
    body: t.Object({
      name: t.String({ minLength: 1 }),
      email: t.String({ format: "email" })
    })
  }, (c) => {
    // c.body is fully typed!
    return c.json({ created: true, user: c.body }, 201);
  })
  .listen({ port: 8000 });`;

const middlewareCode = `const app = new Kage()
  // Derive: compute per request
  .derive((c) => {
    const token = c.headers.get("Authorization");
    return {
      user: token ? parseJWT(token) : null,
      isAuthenticated: !!token
    };
  })
  .get("/me", (c) =>
    c.isAuthenticated
      ? c.json({ user: c.user })
      : c.unauthorized("Login required")
  );`;

const routerCode = `// routes/users.ts
const usersRouter = new Kage({ prefix: "/users" })
  .get("/", (c) => c.json({ users: [] }))
  .get("/:id", (c) => c.json({ id: c.params.id }));

// main.ts
app.mount(usersRouter);  // at /users/*`;

export default define.page(function Home() {
  return (
    <div class="dark">
      <div class="min-h-screen bg-[#0a0a0a] text-white selection:bg-emerald-500/30 overflow-x-hidden">
        <header class="relative z-30">
          <div class="max-w-5xl mx-auto px-8 h-20 flex items-center justify-between">
            <a href="/" class="flex items-center gap-3 group">
              <span class="text-xl font-light tracking-wide">カゲ</span>
              <span class="text-lg font-medium tracking-tight text-white/80">
                kage
              </span>
            </a>
            <nav class="flex items-center gap-8">
              <a
                href="/docs"
                class="text-sm text-white/40 hover:text-white/80 transition-colors"
              >
                Docs
              </a>
              <a
                href="https://github.com/ErickJ3/kage"
                target="_blank"
                rel="noopener noreferrer"
                class="text-sm text-white/40 hover:text-white/80 transition-colors"
              >
                GitHub
              </a>
            </nav>
          </div>
        </header>

        <main>
          <section class="relative min-h-[85vh] flex items-center justify-center px-8">
            <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div class="zen-circle" />
              <div class="zen-circle-shadow" />
            </div>
            <div class="absolute left-[15%] top-[20%] bottom-[20%] w-px bg-gradient-to-b from-transparent via-white/[0.03] to-transparent" />
            <div class="absolute right-[15%] top-[25%] bottom-[25%] w-px bg-gradient-to-b from-transparent via-white/[0.03] to-transparent" />
            <div class="relative z-10 text-center max-w-2xl">
              <div class="absolute -top-20 left-1/2 -translate-x-1/2 text-[180px] font-light text-white/[0.02] select-none pointer-events-none leading-none tracking-wider">
                カゲ
              </div>

              <p class="text-emerald-400/80 text-xs tracking-[0.3em] uppercase mb-8">
                Clear. Simple. Web-first.
              </p>

              <h1 class="text-4xl sm:text-5xl md:text-6xl font-light tracking-tight leading-[1.2] mb-8">
                <span class="text-white/90">Minimalist.</span>
                <br />
                <span class="text-white/40">Powerful.</span>
              </h1>

              <p class="text-base text-white/30 mb-12 max-w-md mx-auto font-light leading-relaxed">
                Type-safe APIs with schema validation.<br />
                Zero hidden abstractions. Native Web Standards.
              </p>

              <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href="/docs/quickstart"
                  class="group inline-flex items-center gap-3 px-6 py-3 border border-white/10 text-sm font-light hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all"
                >
                  <span>Get Started</span>
                  <svg
                    class="w-4 h-4 text-white/40 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="1.5"
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </a>
                <div class="flex items-center gap-2 px-4 py-3 font-mono text-xs text-white/30">
                  <span>deno add jsr:@kage/core</span>
                </div>
              </div>
            </div>
            <div class="absolute bottom-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-b from-white/5 to-transparent" />
          </section>
          <section class="py-32 px-8">
            <div class="max-w-5xl mx-auto">
              <div class="grid lg:grid-cols-2 gap-16 lg:gap-24 items-start">
                <div class="lg:sticky lg:top-24">
                  <p class="text-emerald-400/60 text-xs tracking-[0.2em] uppercase mb-4">
                    Philosophy
                  </p>
                  <h2 class="text-2xl md:text-3xl font-light tracking-tight mb-6 text-white/90">
                    Simple to start.<br />
                    <span class="text-white/30">
                      Powerful when you need it.
                    </span>
                  </h2>
                  <p class="text-white/30 font-light leading-relaxed mb-8">
                    Start with a single endpoint. Scale to complex APIs with
                    plugins, workers, and lifecycle hooks.
                  </p>
                  <ul class="space-y-3">
                    {[
                      "Built-in schema validation",
                      "Type-safe context extensions",
                      "Inline worker pools",
                      "Native Web Standards",
                    ].map((item) => (
                      <li
                        key={item}
                        class="flex items-center gap-3 text-sm text-white/40"
                      >
                        <span class="w-1 h-1 bg-emerald-500/50" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div class="zen-code-block">
                  <CodeHighlight code={heroCode} lang="typescript" />
                </div>
              </div>
            </div>
          </section>
          <section class="py-32 px-8 border-t border-white/[0.03]">
            <div class="max-w-5xl mx-auto">
              <p class="text-emerald-400/60 text-xs tracking-[0.2em] uppercase mb-4 text-center">
                Features
              </p>
              <h2 class="text-2xl md:text-3xl font-light tracking-tight mb-20 text-center text-white/90">
                Everything you need.<br />
                <span class="text-white/30">Nothing you don't.</span>
              </h2>

              <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16">
                {[
                  {
                    title: "Schema Validation",
                    desc:
                      "TypeBox integration with full type inference. Automatic validation errors.",
                  },
                  {
                    title: "Context Extensions",
                    desc:
                      "decorate, derive, and state for clean, type-safe context management.",
                  },
                  {
                    title: "Worker Pools",
                    desc:
                      "Inline worker functions with automatic pooling for CPU-intensive tasks.",
                  },
                  {
                    title: "Lifecycle Hooks",
                    desc:
                      "onRequest, onBeforeHandle, onAfterHandle, onResponse for precise control.",
                  },
                  {
                    title: "Modular Routers",
                    desc:
                      "Built-in prefix support and mounting for clean code organization.",
                  },
                  {
                    title: "Native Web APIs",
                    desc:
                      "Built on Request/Response standards. Zero magic, zero surprises.",
                  },
                ].map((feature) => (
                  <div key={feature.title} class="group">
                    <h3 class="text-sm font-medium mb-2 text-white/70 group-hover:text-emerald-400/80 transition-colors">
                      {feature.title}
                    </h3>
                    <p class="text-sm text-white/25 font-light leading-relaxed">
                      {feature.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
          <section class="py-32 px-8 border-t border-white/[0.03]">
            <div class="max-w-5xl mx-auto">
              <div class="grid md:grid-cols-2 gap-12">
                <div>
                  <p class="text-white/20 text-xs tracking-[0.15em] uppercase mb-4">
                    Context Extensions
                  </p>
                  <div class="zen-code-block-sm">
                    <CodeHighlight code={middlewareCode} lang="typescript" />
                  </div>
                </div>
                <div>
                  <p class="text-white/20 text-xs tracking-[0.15em] uppercase mb-4">
                    Modular Routers
                  </p>
                  <div class="zen-code-block-sm">
                    <CodeHighlight code={routerCode} lang="typescript" />
                  </div>
                </div>
              </div>
            </div>
          </section>
          <section class="py-32 px-8 border-t border-white/[0.03]">
            <div class="max-w-5xl mx-auto text-center">
              <p class="text-5xl font-light text-white/[0.03] mb-8 select-none tracking-wider">
                カゲ
              </p>
              <h2 class="text-2xl md:text-3xl font-light tracking-tight mb-6 text-white/90">
                Start building.
              </h2>
              <p class="text-white/30 mb-10 font-light">
                One line to install. One line to run.
              </p>
              <div class="inline-flex flex-col sm:flex-row gap-4">
                <a
                  href="/docs"
                  class="inline-flex items-center justify-center px-8 py-3 bg-white/90 text-black text-sm font-medium hover:bg-white transition-colors"
                >
                  Documentation
                </a>
                <a
                  href="https://github.com/ErickJ3/kage"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex items-center justify-center gap-2 px-8 py-3 border border-white/10 text-sm font-light hover:border-white/20 transition-colors"
                >
                  GitHub
                </a>
              </div>
            </div>
          </section>
        </main>
        <footer class="border-t border-white/[0.03] py-12 px-8">
          <div class="max-w-5xl mx-auto">
            <div class="flex flex-col md:flex-row justify-between items-center gap-6">
              <div class="flex items-center gap-3">
                <span class="text-base font-light text-white/20 tracking-wide">
                  カゲ
                </span>
                <span class="text-white/20 text-sm font-light">
                  MIT License
                </span>
              </div>
              <div class="flex items-center gap-8 text-sm text-white/20 font-light">
                <a href="/docs" class="hover:text-white/40 transition-colors">
                  Docs
                </a>
                <a
                  href="https://github.com/ErickJ3/kage"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="hover:text-white/40 transition-colors"
                >
                  GitHub
                </a>
                <a
                  href="https://jsr.io/@kage/core"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="hover:text-white/40 transition-colors"
                >
                  JSR
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
});
