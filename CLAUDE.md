# Claude Instructions

This is my personal website.

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
│   ├── components
│   ├── layouts
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

## MCP Servers

### Context7

Always use context7 when I need code generation, setup or configuration steps, or library/API documentation. This means you should automatically use the Context7 MCP tools to resolve library id and get library docs without me having to explicitly ask.
