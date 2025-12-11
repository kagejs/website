import { useEffect } from "preact/hooks";

export default function CodeCopyButtons() {
  useEffect(() => {
    const codeBlocks = document.querySelectorAll(".shiki-wrapper");

    codeBlocks.forEach((wrapper, index) => {
      if (wrapper.querySelector(".copy-btn")) return;

      const container = wrapper.parentElement;
      if (container && !container.classList.contains("code-block-container")) {
        container.classList.add("code-block-container");
        container.style.position = "relative";
      }

      const btn = document.createElement("button");
      btn.className = "copy-btn";
      btn.setAttribute("data-index", String(index));
      btn.innerHTML = `
        <svg class="copy-icon w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
        </svg>
        <svg class="check-icon w-4 h-4 hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
        </svg>
      `;

      btn.addEventListener("click", async () => {
        const code = wrapper.querySelector("code");
        if (code) {
          try {
            await navigator.clipboard.writeText(code.textContent || "");
            const copyIcon = btn.querySelector(".copy-icon");
            const checkIcon = btn.querySelector(".check-icon");
            copyIcon?.classList.add("hidden");
            checkIcon?.classList.remove("hidden");
            setTimeout(() => {
              copyIcon?.classList.remove("hidden");
              checkIcon?.classList.add("hidden");
            }, 2000);
          } catch (err) {
            console.error("Failed to copy:", err);
          }
        }
      });

      wrapper.appendChild(btn);
    });
  }, []);

  return null;
}
