// @ts-check

import mdx from "@astrojs/mdx";
import partytown from "@astrojs/partytown";
import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";
import externalLinkDecorator from "./src/plugins/external-link-decorator";

// https://astro.build/config
export default defineConfig({
  site: "https://jarrettmeyer.com",
  markdown: {
    rehypePlugins: [externalLinkDecorator],
  },
  integrations: [
    mdx({ rehypePlugins: [externalLinkDecorator] }),
    sitemap(),
    partytown({
      config: { forward: ["dataLayer.push", "gtag"] },
    }),
  ],
});
