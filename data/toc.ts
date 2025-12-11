export interface TocEntry {
  title: string;
  slug: string;
  file: string;
}

export interface TocCategory {
  title: string;
  items: TocEntry[];
}

export const toc: TocCategory[] = [
  {
    title: "Getting Started",
    items: [
      { title: "Introduction", slug: "", file: "index.md" },
      { title: "Installation", slug: "installation", file: "installation.md" },
      { title: "Quick Start", slug: "quickstart", file: "quickstart.md" },
    ],
  },
  {
    title: "Core Concepts",
    items: [
      { title: "Routing", slug: "concepts/routing", file: "concepts/routing.md" },
      { title: "Context", slug: "concepts/context", file: "concepts/context.md" },
      { title: "Middleware", slug: "concepts/middleware", file: "concepts/middleware.md" },
      { title: "Schema Validation", slug: "concepts/schema", file: "concepts/schema.md" },
    ],
  },
  {
    title: "Advanced",
    items: [
      { title: "Plugins", slug: "advanced/plugins", file: "advanced/plugins.md" },
      { title: "Mounting Routers", slug: "advanced/mounting", file: "advanced/mounting.md" },
      { title: "State Management", slug: "advanced/state", file: "advanced/state.md" },
      { title: "Workers", slug: "advanced/workers", file: "advanced/workers.md" },
    ],
  },
  {
    title: "API Reference",
    items: [
      { title: "Kage Class", slug: "api/kage", file: "api/kage.md" },
      { title: "Context", slug: "api/context", file: "api/context.md" },
      { title: "Types", slug: "api/types", file: "api/types.md" },
    ],
  },
];

export interface NavEntry {
  title: string;
  category?: string;
  href: string;
}

export interface FlatEntry extends TocEntry {
  category: string;
  href: string;
}

function flattenToc(): FlatEntry[] {
  const flat: FlatEntry[] = [];
  for (const category of toc) {
    for (const item of category.items) {
      flat.push({
        ...item,
        category: category.title,
        href: item.slug ? `/docs/${item.slug}` : "/docs",
      });
    }
  }
  return flat;
}

const flatToc = flattenToc();

export function getEntryBySlug(slug: string): FlatEntry | undefined {
  return flatToc.find((entry) => entry.slug === slug);
}

export function getNavigation(slug: string): {
  prev?: NavEntry;
  next?: NavEntry;
} {
  const idx = flatToc.findIndex((entry) => entry.slug === slug);
  if (idx === -1) return {};

  const prev = flatToc[idx - 1];
  const next = flatToc[idx + 1];

  return {
    prev: prev
      ? { title: prev.title, category: prev.category, href: prev.href }
      : undefined,
    next: next
      ? { title: next.title, category: next.category, href: next.href }
      : undefined,
  };
}

export function getSidebarNavigation(): { title: string; href: string; items?: { title: string; href: string }[] }[] {
  return toc.map((category) => ({
    title: category.title,
    href: "#",
    items: category.items.map((item) => ({
      title: item.title,
      href: item.slug ? `/docs/${item.slug}` : "/docs",
    })),
  }));
}
