# Claude Instructions

This is my personal website deployed to GitHub pages.

## Project Structure

```text
├── dist/                       # Astro build output
├── docs/
├── node_modules/
├── public/
│   ├── images/
│   ├── CNAME
│   ├── favicon.ico
│   ├── robots.txt
│   └── site.css                # Globally applied CSS
├── src/                        # Source code for website
│   ├── components/             # Astro component
│   ├── layouts/                # Astro layouts
│   ├── pages/                  # Astro pages
│   │   ├── present/            # Presentations, Reveal.js
│   │   ├── tags/
│   │   └── visualize/
│   ├── posts/                  # Astro posts, *.md or *.mdx
│   ├── utils/                  # TypeScript utilities
│   ├── content.config.ts
│   └── types.ts
├── astro.config.ts
├── CLAUDE.md
├── package-lock.json
├── package.json
├── README.md
└── tsconfig.json
```

### `src/`

Astro website source code.

### `src/components/`

Contains [Astro components](https://docs.astro.build/en/basics/astro-components/). These are reusable pieces of content.

### `src/hooks/`

Reusable [React](https://react.dev/) hooks.

### `src/layouts/`

Contains [Astro layouts](https://docs.astro.build/en/basics/layouts/).

### `src/pages/`

Site pages, written in Astro.

### `src/pages/tags/`

### `src/pages/visualize/`

### `src/posts/`

Posts, written in either `*.md` or `*.mdx` format.

### `src/scripts/`

Scripts in this folder are intended to be used as client scripts for specific pages.

### `src/utils/`

Utility functions, written in TypeScript, used throughout the website.

## Develop

The development website runs at [localhost:4321](http://localhost:4321). If the development site is not running, it can be started with `npm run dev`. The development server can be used with Playwright for browser automation testing.

### Guidelines

- Use TypeScript for all scripts.
- Create descriptive variables instead of magic numbers or strings. Do this even for one-time use variables.
- Avoid adding inline styles to HTML elements. Instead, always use an available Bootstrap utility class when possible. This includes color, font size, font weight, sizing, padding, margins, etc.

## Build

To build the project, run `npm run build`.

## Deploy

This website is hosted in GitHub pages. The website is deployed when source code is pushed to the `main` branch. See [publish_github_pages.yaml](./.github/workflows/publish_github_pages.yaml) for more details.

## MCP Servers

### Context7

Always use context7 when I need code generation, setup or configuration steps, or library/API documentation. This means you should automatically use the Context7 MCP tools to resolve library id and get library docs without me having to explicitly ask.

This includes, but is not limited to, the following libraries:

- Astro
- Boostrap
- Pagefind
- Playwright

### Playwright

Always use Playwright for browser automation testing.
