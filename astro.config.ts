// @ts-check
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import expressiveCode from "astro-expressive-code";
import pagefind from "astro-pagefind";
import { defineConfig } from "astro/config";
import tsconfigPaths from "vite-tsconfig-paths";

// https://astro.build/config
export default defineConfig({
  site: "https://jarrettmeyer.com",
  integrations: [expressiveCode(), mdx(), pagefind(), sitemap()],
  vite: {
    plugins: [tsconfigPaths() as any],
  },
});
