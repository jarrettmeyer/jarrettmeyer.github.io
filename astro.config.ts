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

/** Paths excluded from the sitemap and not intended for public discovery. */
const SITEMAP_EXCLUDED_PATHS = ["/present/", "/visualize/"];

// https://astro.build/config
export default defineConfig({
  site: "https://jarrettmeyer.com",
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],
  },
  integrations: [
    expressiveCode(),
    mdx(),
    pagefind(),
    sitemap({
      filter: (page) =>
        SITEMAP_EXCLUDED_PATHS.every((path) => !page.includes(path)),
    }),
    react(),
  ],
  vite: {
    plugins: [tsconfigPaths() as any],
  },
});
