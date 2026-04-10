// @ts-check

import mdx from "@astrojs/mdx";
import partytown from "@astrojs/partytown";
import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";
import externalLinkDecorator from "./src/plugins/external-link-decorator";
import rehypeMermaid from "rehype-mermaid";

// https://astro.build/config
export default defineConfig({
  site: "https://jarrettmeyer.com",
  markdown: {
    rehypePlugins: [externalLinkDecorator, rehypeMermaid],
    syntaxHighlight: {
      excludeLangs: ["mermaid"],
    },
  },
  integrations: [
    mdx({
      rehypePlugins: [
        externalLinkDecorator,
        [rehypeMermaid, { strategy: "img-svg" }],
      ],
      syntaxHighlight: { excludeLangs: ["mermaid"], type: "shiki" },
    }),
    sitemap(),
    partytown({
      config: { forward: ["dataLayer.push", "gtag"] },
    }),
  ],
});
