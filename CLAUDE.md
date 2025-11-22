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

#### `Alert.astro`

Alert messages component based on [Bootstrap Alerts](https://getbootstrap.com/docs/5.3/components/alerts/).

#### `Certifications.astro`

#### `FeaturedContent.astro`

#### `Hero.astro`

#### `LeetCodeHeader.astro`

#### `LeetCodeResult.astro`

#### `ListPosts.astro`

#### `Navbar.astro`

Site navigation component based on [Bootstrap Navbar](https://getbootstrap.com/docs/5.3/components/navbar/).

#### `SearchModal.astro`

Search component based on [Pagefind](https://pagefind.app/) and [Bootstrap Modal](https://getbootstrap.com/docs/5.3/components/modal/).

### `src/layouts`

Contains [Astro layouts](https://docs.astro.build/en/basics/layouts/).

### `src/pages`

#### `learn/heap.astro`

Visualization demonstrating how min and max heaps work. The client script for this page is located at `src/utils/visualizations/heap.ts`.

### `src/posts`

Posts, written in either `*.md` or `*.mdx` format.

## Develop

The development website runs at [localhost:4321](http://localhost:4321). If the development site is not running, it can be started with `npm run dev`. The development server can be used with Playwright for browser automation testing. 

You can use Playwright to determine if the development server is running. If you open `localhost:4321` and see  the page and see "localhost refused to connect", then the development server is not running. Use `npm run dev` to start the development server.

## Build

To build the project, run `npm run build`.

## Deploy

This website is hosted in GitHub pages. The website is deployed when source code is pushed to the `main` branch. See [publish_github_pages.yaml](./.github/workflows/publish_github_pages.yaml) for more details.

## MCP Servers

### Context7

Always use Context7 when I need code generation, setup or configuration steps, or library/API documentation. This means you should automatically use the Context7 MCP tools to resolve library ID and get library documentation without me having to explicitly ask. This includes, but is not limited to, the following libraries:

- Astro
- Boostrap
- Pagefind
- Playwright

### Playwright

Always use Playwright for browser automation testing. **DO NOT** take browser screenshots or snapshots. Close the browser after you complete testing.
