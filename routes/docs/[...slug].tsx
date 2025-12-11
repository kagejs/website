import { HttpError, page } from "fresh";
import { define } from "../../utils.ts";
import DocsLayout from "../../components/docs/DocsLayout.tsx";
import { loadMarkdownFile, type Heading } from "../../utils/markdown.ts";
import { getEntryBySlug, getNavigation, type NavEntry } from "../../data/toc.ts";

interface Data {
  title: string;
  description?: string;
  html: string;
  headings: Heading[];
  currentPath: string;
  prev?: NavEntry;
  next?: NavEntry;
}

export const handler = define.handlers<Data>({
  async GET(ctx) {
    const slugParts = ctx.params.slug;
    const slug = slugParts || "";

    const entry = getEntryBySlug(slug);
    if (!entry) {
      throw new HttpError(404);
    }

    const filePath = new URL(
      `../../content/docs/${entry.file}`,
      import.meta.url
    );

    let parsed;
    try {
      parsed = await loadMarkdownFile(filePath.pathname);
    } catch {
      throw new HttpError(404);
    }

    const { prev, next } = getNavigation(slug);

    return page({
      title: parsed.frontmatter.title || entry.title,
      description: parsed.frontmatter.description as string | undefined,
      html: parsed.html,
      headings: parsed.headings,
      currentPath: entry.href,
      prev,
      next,
    });
  },
});

export default define.page<typeof handler>(function DocsPage(props) {
  const { title, html, currentPath, prev, next } = props.data;

  return (
    <DocsLayout currentPath={currentPath} title={title} prev={prev} next={next}>
      <div
        class="markdown-body"
        // deno-lint-ignore react-no-danger
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </DocsLayout>
  );
});
