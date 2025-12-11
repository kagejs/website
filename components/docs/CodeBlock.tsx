import CopyButton from "../../islands/CopyButton.tsx";

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
  html?: string;
}

export default function CodeBlock({
  code,
  language = "typescript",
  filename,
  html,
}: CodeBlockProps) {
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
        {html ? (
          <div
            class="shiki-wrapper [&>pre]:!bg-[#0d0d0f] [&>pre]:!p-4 [&>pre]:!m-0 [&>pre]:border [&>pre]:border-white/[0.08] [&>pre]:overflow-x-auto [&_code]:!text-[13px] [&_code]:!leading-[1.7] [&_code]:font-mono [&_.line]:min-h-[1.7em]"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        ) : (
          <div class="bg-[#0d0d0f] border border-white/[0.08] p-4 overflow-x-auto">
            <pre class="text-[13px] leading-[1.7]">
              <code class={`language-${language} text-[#e6e8ec] font-mono`}>{code}</code>
            </pre>
          </div>
        )}
        <div class="opacity-0 group-hover:opacity-100 transition-opacity">
          <CopyButton code={code} />
        </div>
      </div>
    </div>
  );
}
