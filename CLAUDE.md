# jarrettmeyer.github.io

This repository hosts the personal portfolio and blog of Jarrett Meyer. The website is hosted on GitHub pages at [jarrettmeyer.com](https://jarrettmeyer.com).

The website is written in [Astro](https://docs.astro.build/en/getting-started/).

When running locally, the default URL is [localhost:4321](http://localhost:4321).

## General Guidance

- **package.json**: Read `./package.json` to see what NPM packages are available.

## Styling

- **Bootstrap**: The page is styled with [Bootstrap](https://getbootstrap.com/docs/5.3/getting-started/introduction/). 
  - Avoid creating new CSS classes. Instead favor Boostrap utility classes for color, positioning, text, etc.
- **Bootstrap icons**: Use [Bootstrap Icons](https://icons.getbootstrap.com/).

## Site Functionality

### Pagefind

- This site uses [Pagefind](https://pagefind.app/), a fully static search library. 
- Pagefind runs after `npm run build`.
- Run with `pagefind --site dist`.

## References

- [This repository (jarrettmeyer/jarrettmeyer.github.io)](https://github.com/jarrettmeyer/jarrettmeyer.github.io)
- [Deploy your Astro Site to GitHub Pages](https://docs.astro.build/en/guides/deploy/github/)
