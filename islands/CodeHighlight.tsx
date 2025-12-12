import { useEffect, useRef, useState } from "preact/hooks";

interface CodeHighlightProps {
  code: string;
  lang?: string;
  filename?: string;
}

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

export default function CodeHighlight({
  code,
  lang = "typescript",
  filename,
}: CodeHighlightProps) {
  const [html, setHtml] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const codeRef = useRef<HTMLElement>(null);

  useEffect(() => {
    async function loadHighlighter() {
      try {
        const { codeToHtml } = await import("shiki");
        const highlighted = await codeToHtml(code, {
          lang: lang === "ts"
            ? "typescript"
            : lang === "js"
            ? "javascript"
            : lang,
          theme: kageTheme,
        });
        setHtml(highlighted);
      } catch (e) {
        console.error("Failed to highlight:", e);
      }
    }
    loadHighlighter();
  }, [code, lang]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div class="my-6 group">
      {filename && (
        <div class="flex items-center gap-2 px-4 py-2.5 bg-white/[0.03] border border-white/10 border-b-0 text-xs text-white/50">
          <svg
            class="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          {filename}
        </div>
      )}
      <div class="relative">
        {html
          ? (
            <div
              class="shiki-wrapper [&>pre]:!bg-[#0d0d0f] [&>pre]:!p-4 [&>pre]:!m-0 [&>pre]:border [&>pre]:border-white/[0.08] [&>pre]:overflow-x-auto [&_code]:!text-[13px] [&_code]:!leading-[1.7] [&_code]:font-mono [&_.line]:min-h-[1.7em]"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          )
          : (
            <div class="bg-[#0d0d0f] border border-white/[0.08] p-4 overflow-x-auto">
              <pre class="text-[13px] leading-[1.7]">
              <code ref={codeRef} class="text-[#e6e8ec] font-mono">
                {code}
              </code>
              </pre>
            </div>
          )}
        <button
          type="button"
          onClick={handleCopy}
          class="absolute top-3 right-3 p-2 text-white/40 hover:text-white/70 hover:bg-white/10 transition-all opacity-0 group-hover:opacity-100"
          title={copied ? "Copied!" : "Copy code"}
        >
          {copied
            ? (
              <svg
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )
            : (
              <svg
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            )}
        </button>
      </div>
    </div>
  );
}
