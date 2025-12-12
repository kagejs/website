import { Marked } from "marked";
import { getHeadingList, gfmHeadingId } from "marked-gfm-heading-id";
import { parse as parseYaml } from "@std/yaml";
import { highlight } from "./shiki.ts";

function parseFrontmatter(content: string): {
  data: Record<string, unknown>;
  content: string;
} {
  const frontmatterRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    return { data: {}, content };
  }

  const yamlStr = match[1];
  const markdown = match[2];

  try {
    const data = parseYaml(yamlStr) as Record<string, unknown>;
    return { data: data ?? {}, content: markdown };
  } catch {
    return { data: {}, content: markdown };
  }
}

export interface Heading {
  id: string;
  text: string;
  level: number;
}

export interface ParsedMarkdown {
  html: string;
  headings: Heading[];
  frontmatter: {
    title?: string;
    description?: string;
    [key: string]: unknown;
  };
}

const marked = new Marked();

marked.use(gfmHeadingId());

marked.use({
  async: true,
  async walkTokens(token) {
    if (token.type === "code") {
      const language = token.lang || "typescript";
      const highlighted = await highlight(token.text, language);
      (token as unknown as { highlighted: string }).highlighted = highlighted;
    }
  },
  renderer: {
    code(
      { text, highlighted }: {
        text: string;
        lang?: string;
        highlighted?: string;
      },
    ) {
      if (highlighted) {
        return `<div class="shiki-wrapper my-6">${highlighted}</div>`;
      }
      return `<pre><code>${text}</code></pre>`;
    },
  },
});

export async function parseMarkdown(content: string): Promise<ParsedMarkdown> {
  const { data: frontmatter, content: markdown } = parseFrontmatter(content);

  const html = await marked.parse(markdown);

  const headings = getHeadingList().map((h) => ({
    id: h.id,
    text: h.text,
    level: h.level,
  }));

  return {
    html,
    headings,
    frontmatter,
  };
}

export async function loadMarkdownFile(
  filePath: string,
): Promise<ParsedMarkdown> {
  const content = await Deno.readTextFile(filePath);
  return parseMarkdown(content);
}
