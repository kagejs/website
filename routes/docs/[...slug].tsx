import { HttpError, page } from "fresh";
import { define } from "../../utils.ts";
import DocsLayout from "../../components/docs/DocsLayout.tsx";
import { type Heading, loadMarkdownFile } from "../../utils/markdown.ts";
import {
  getEntryBySlug,
  getNavigation,
  type NavEntry,
} from "../../data/toc.ts";

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

    const prodPath = new URL("../content/docs/", import.meta.url).pathname;
    const devPath = new URL("../../content/docs/", import.meta.url).pathname;

    let parsed;
    let filePath = `${prodPath}${entry.file}`;

    try {
      parsed = await loadMarkdownFile(filePath);
    } catch {
      filePath = `${devPath}${entry.file}`;
      try {
        parsed = await loadMarkdownFile(filePath);
      } catch {
        throw new HttpError(404);
      }
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
