import type { ComponentChildren } from "preact";
import Header from "./Header.tsx";
import Sidebar from "./Sidebar.tsx";
import TableOfContents from "../../islands/TableOfContents.tsx";
import CodeCopyButtons from "../../islands/CodeCopyButtons.tsx";

interface NavEntry {
  title: string;
  category?: string;
  href: string;
}

interface DocsLayoutProps {
  children: ComponentChildren;
  currentPath: string;
  title?: string;
  prev?: NavEntry;
  next?: NavEntry;
}

export default function DocsLayout({
  children,
  currentPath,
  title,
  prev,
  next,
}: DocsLayoutProps) {
  return (
    <div class="min-h-screen bg-[#0a0a0a]">
      <Header />
      <div class="flex justify-center">
        <div class="flex w-full max-w-[1400px]">
          <Sidebar currentPath={currentPath} />
          <main class="flex-1 min-w-0 px-8 py-12 lg:px-16">
            <article class="max-w-2xl">
              {title && (
                <div class="mb-12">
                  <h1
                    class="text-2xl md:text-3xl font-light tracking-tight text-white/90"
                    id="page-title"
                  >
                    {title}
                  </h1>
                  <div class="mt-4 w-12 h-px bg-emerald-500/30" />
                </div>
              )}
              <div class="docs-content">{children}</div>
              <CodeCopyButtons />
              {(prev || next) && (
                <div class="mt-12 flex flex-col sm:flex-row gap-4 justify-between">
                  {prev
                    ? (
                      <a
                        href={prev.href}
                        class="px-4 py-3 text-left border border-white/10 grid w-full hover:border-emerald-500/50 transition-colors"
                      >
                        <span class="text-xs text-white/40">Previous</span>
                        <span class="text-emerald-400/90 font-medium">
                          {prev.title}
                        </span>
                      </a>
                    )
                    : <div class="w-full" />}
                  {next
                    ? (
                      <a
                        href={next.href}
                        class="px-4 py-3 text-left border border-white/10 grid w-full hover:border-emerald-500/50 transition-colors"
                      >
                        <span class="text-xs text-white/40">Next</span>
                        <span class="text-emerald-400/90 font-medium">
                          {next.title}
                        </span>
                      </a>
                    )
                    : <div class="w-full" />}
                </div>
              )}
            </article>
          </main>
          <aside class="w-48 shrink-0 hidden xl:block py-12 pr-8">
            <div class="sticky top-24">
              <h4 class="text-[10px] font-medium text-white/30 uppercase tracking-[0.2em] mb-4">
                On this page
              </h4>
              <TableOfContents />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
