# Claude Instructions

This is my personal website deployed to GitHub pages.

## Project Structure

```text
├── dist                        # Astro build output
├── docs
├── node_modules
├── public
│   ├── images
│   ├── CNAME
│   ├── favicon.ico
│   ├── robots.txt
│   └── site.css                # Globally applied CSS
├── src                         # Source code for website
│   ├── components              # Astro component
│   ├── layouts                 # Astro layouts
│   ├── pages                   # Astro pages
│   ├── posts                   # Astro posts, *.md or *.mdx
│   ├── utils                   # TypeScript utilities
│   ├── content.config.ts
│   └── types.ts
├── astro.config.ts
├── CLAUDE.md
├── package-lock.json
├── package.json
├── README.md
└── tsconfig.json
```

### `src/components`

Contains [Astro components](https://docs.astro.build/en/basics/astro-components/). These are reusable pieces of content.

### `Navbar.astro`

Site navigation.

### `src/layouts`

Contains [Astro layouts](https://docs.astro.build/en/basics/layouts/).

### `src/pages`

### `src/posts`

Posts, written in either `*.md` or `*.mdx` format.

## Build

To build the project, run `npm run build`.

## Deploy

This website is hosted in GitHub pages. The website is deployed when source code is pushed to the `main` branch. See [publish_github_pages.yaml](./.github/workflows/publish_github_pages.yaml) for more details.

## MCP Servers

### Context7

Always use context7 when I need code generation, setup or configuration steps, or library/API documentation. This means you should automatically use the Context7 MCP tools to resolve library id and get library docs without me having to explicitly ask.
