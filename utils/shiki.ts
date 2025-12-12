import { createHighlighter, type Highlighter } from "shiki";

const kageTheme = {
  name: "kage",
  type: "dark" as const,
  colors: {
    "editor.background": "#0d0d0f",
    "editor.foreground": "#e6e8ec",
  },
  settings: [
    {
      scope: ["comment", "punctuation.definition.comment"],
      settings: { foreground: "#5c6370", fontStyle: "italic" },
    },
    {
      scope: ["keyword", "storage.type", "storage.modifier"],
      settings: { foreground: "#c678dd" },
    },
    {
      scope: ["string", "string.quoted"],
      settings: { foreground: "#98c379" },
    },
    {
      scope: ["constant.numeric", "constant.language"],
      settings: { foreground: "#d19a66" },
    },
    {
      scope: ["entity.name.function", "support.function"],
      settings: { foreground: "#61afef" },
    },
    {
      scope: [
        "entity.name.type",
        "entity.name.class",
        "support.type",
        "support.class",
      ],
      settings: { foreground: "#e5c07b" },
    },
    {
      scope: ["variable", "variable.other"],
      settings: { foreground: "#e06c75" },
    },
    {
      scope: ["variable.parameter"],
      settings: { foreground: "#e6e8ec" },
    },
    {
      scope: ["entity.name.tag"],
      settings: { foreground: "#e06c75" },
    },
    {
      scope: ["entity.other.attribute-name"],
      settings: { foreground: "#d19a66" },
    },
    {
      scope: ["punctuation", "meta.brace"],
      settings: { foreground: "#9ca3af" },
    },
    {
      scope: ["constant.other.symbol"],
      settings: { foreground: "#56b6c2" },
    },
    {
      scope: ["support.constant", "constant.other"],
      settings: { foreground: "#56b6c2" },
    },
    {
      scope: ["meta.object-literal.key"],
      settings: { foreground: "#e06c75" },
    },
    {
      scope: ["keyword.operator"],
      settings: { foreground: "#56b6c2" },
    },
    {
      scope: ["punctuation.definition.template-expression"],
      settings: { foreground: "#c678dd" },
    },
  ],
};

let highlighter: Highlighter | null = null;

export async function getHighlighter(): Promise<Highlighter> {
  if (!highlighter) {
    highlighter = await createHighlighter({
      themes: [kageTheme],
      langs: ["typescript", "javascript", "json", "bash", "tsx", "jsx"],
    });
  }
  return highlighter;
}

export async function highlight(
  code: string,
  lang: string = "typescript",
): Promise<string> {
  const hl = await getHighlighter();

  const validLangs = [
    "typescript",
    "javascript",
    "json",
    "bash",
    "tsx",
    "jsx",
    "ts",
    "js",
  ];
  const language = validLangs.includes(lang) ? lang : "typescript";

  return hl.codeToHtml(code, {
    lang: language === "ts"
      ? "typescript"
      : language === "js"
      ? "javascript"
      : language,
    theme: "kage",
  });
}
