import { defineConfig } from "vite";
import { fresh } from "@fresh/plugin-vite";
import tailwindcss from "@tailwindcss/vite";
import { viteStaticCopy } from "vite-plugin-static-copy";

export default defineConfig({
  plugins: [
    fresh(),
    tailwindcss(),
    viteStaticCopy({
      targets: [
        {
          src: "content",
          dest: ".",
        },
      ],
    }),
  ],
});
