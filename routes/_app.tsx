import { define } from "../utils.ts";

export default define.page(function App({ Component }) {
  return (
    <html lang="en" class="dark">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta
          name="description"
          content="Kage - Type-safe. Minimal. Built on Web Standards."
        />
        <title>Kage - Type-safe. Minimal. Built on Web Standards.</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossorigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      </head>
      <body class="bg-[#0A0A0A] text-white min-h-screen">
        <Component />
      </body>
    </html>
  );
});
