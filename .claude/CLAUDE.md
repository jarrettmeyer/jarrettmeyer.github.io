# Claude Instructions

Personal website (jarrettmeyer.com) built with Astro, deployed to GitHub Pages on push to `main`.

## Workflow

- Always start in plan mode. Ask clarifying questions before writing code.
- Define and verify success criteria before claiming done.
- Use worktrees for feature work. Worktrees are saved in `.worktrees/<branch-name>`.
- Prefer smaller, atomic commits. We can always squash later.
- Test locally: run the dev server (`bun run dev`). Use Playwright for more sophisticated testing.
- Create a pull request when work is complete.
- Match Jarrett's writing tone and style in blog posts — sound like a person, not an AI.

### Plan Structure

Every implementation plan must include these four sections:

1. **Branch** — Create a worktree with a descriptive branch name
2. **Changes** — The actual code changes
3. **Verification** — Concrete steps: build, dev server, Playwright checks
4. **PR** — Commit, push, and create a pull request

## Commands

- `bun run dev` — dev server at localhost:4321
- `bun run build` — build (astro build + pagefind index + copy-404)
- `bun run format` — format all files with Prettier
- `bun run format:check` — check formatting (used in CI)
- CI: `.github/workflows/publish_github_pages.yaml`

## Tech Stack

- **Astro 5** with MDX, React 19, Expressive Code, Pagefind, Sitemap
- **Bootstrap 5.3** via CDN (dark theme default). Use Bootstrap utility classes — no inline styles.
- **TypeScript** (strict mode). Path alias: `@/*` → `src/*`
- **Google Fonts**: Fira Code (code display)
- **D3 v7** for data visualizations

## Posts (`src/posts/`)

All posts are `.mdx` files organized in subdirectories:

- `leetcode/` — LeetCode problem solutions
- `software/` — general software/engineering articles
- `drafts/` — work-in-progress posts (set `draft: true`)

### Frontmatter (defined in `src/content.config.ts`)

```yaml
title: "Post Title" # required
date: YYYY-MM-DD # required
description: "Summary" # optional
tags: [Tag1, Tag2] # optional
draft: true # optional, only in drafts/
thumbnail: # optional
  src: /images/posts/thumbnails/example.svg
  alt: "Alt text"
```

### LeetCode Post Pattern

```mdx
import LeetCodeHeader from "@/components/LeetCodeHeader.astro";
import LeetCodeResult from "@/components/LeetCodeResult.astro";

<LeetCodeHeader difficulty="Easy" href="https://leetcode.com/problems/..." />

## Solution explanation...

<LeetCodeResult runtime={0} beats={100.0} />
```

### Software Post Pattern

Freeform article structure. Code fences support titles: ` ```toml title="pyproject.toml" `

## Layouts (`src/layouts/`)

- **PageLayout** — standard pages and posts. Props: `title`, `description`, `image`, `url`, `includeInSearchResults`, `isDraft`
- **SlideLayout** — Reveal.js presentations (`src/pages/present/`). Props: `title`, `includeInSearchResults`

## Key Components (`src/components/`)

| Component               | Purpose                                |
| ----------------------- | -------------------------------------- |
| `ListPosts.astro`       | Post grid with filtering (count, tag)  |
| `TagBadge.astro`        | Tag link badge                         |
| `Alert.astro`           | Bootstrap alert wrapper (type prop)    |
| `LeetCodeHeader.astro`  | Problem link + difficulty badge        |
| `LeetCodeResult.astro`  | Runtime performance card               |
| `Navbar.astro`          | Site navigation                        |
| `Hero.astro`            | Homepage hero section                  |
| `SearchModal.astro`     | Pagefind search modal                  |
| `FeaturedContent.astro` | CTA card with title, description, link |
| `Certifications.astro`  | Certification badges row               |

## Utilities (`src/utils/`)

- `posts.ts` — `getAllPosts()`, filters (`filterByCount`, `filterByDate`, `filterByDraft`, `filterByTag`), `sortPostsByDate`
- `dates.ts` — `toFriendlyDate(date)` → "8 Mar 2026"
- `slugify.ts` — `slugifyTag(input)` → URL-safe slug

## Guidelines

- Use TypeScript for all scripts.
- Create descriptive variables instead of magic numbers or strings.
- Use Bootstrap utility classes for styling — no inline styles.
- Images: use `import { Image } from "astro:assets"` with assets from `@/assets/images/`.
- EditorConfig: 2-space indent, LF line endings, UTF-8.

## MCP Servers

### Context7

Always use Context7 for code generation, setup/configuration, or library/API docs. This includes Astro, Bootstrap, and Pagefind.
