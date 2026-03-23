// @ts-check
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import expressiveCode from "astro-expressive-code";
import pagefind from "astro-pagefind";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import { defineConfig } from "astro/config";
import tsconfigPaths from "vite-tsconfig-paths";

import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  site: "https://jarrettmeyer.com",
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],
  },
  integrations: [expressiveCode(), mdx(), pagefind(), sitemap(), react()],
  vite: {
    plugins: [tsconfigPaths() as any],
  },
});
