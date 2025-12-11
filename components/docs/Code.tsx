import { highlight } from "../../utils/shiki.ts";
import CopyButton from "../../islands/CopyButton.tsx";

interface CodeProps {
  code: string;
  lang?: string;
}

export default async function Code({
  code,
  lang = "typescript",
}: CodeProps) {
  const html = await highlight(code, lang);

  return (
    <div class="my-6 group relative zen-code-block">
      <div
        class="shiki-wrapper [&>pre]:!bg-transparent [&>pre]:!p-5 [&>pre]:!m-0 [&>pre]:overflow-x-auto [&_code]:!text-[13px] [&_code]:!leading-[1.7] [&_code]:font-mono [&_.line]:min-h-[1.7em]"
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <div class="opacity-0 group-hover:opacity-100 transition-opacity">
        <CopyButton code={code} />
      </div>
    </div>
  );
}
