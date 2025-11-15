// @ts-check
import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";

import expressiveCode from "astro-expressive-code";

// https://astro.build/config
export default defineConfig({
  site: "https://jarrettmeyer.com",
  integrations: [expressiveCode(), sitemap()],
});
