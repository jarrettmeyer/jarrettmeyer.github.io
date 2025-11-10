import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const posts = defineCollection({
  loader: glob({
    base: "src/posts",
    pattern: "**/*.md",
  }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    draft: z.boolean().optional(),
    description: z.string().optional(),
    thumbnail: z.object({
      src: z.string(),
      alt: z.string(),
    }).optional(),
  }),
});

export const collections = { posts };
