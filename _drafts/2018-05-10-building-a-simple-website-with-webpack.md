---
title:    "Building a Simple Website with Webpack"
layout:   post
date:     2018-05-10
---

Earlier this week, I walked into a new client's office. I met with project owners and stakeholders. I listened to past accomplishments, current challenges, and future expectations. And then... I saw code for the first time.

```
some-project/
  index.html
  index.js
  style.css
```

The `index.html` was only about 20 lines long. The `style.css` was certainly reasonable. The `index.js` file was thousands of lines long. It was just as horrendous as you think it was.

### What's the better way?

Webpack and ES6 lets us build modular websites. Modular means code reuse and sane development. Let's start by setting up a new [NodeJS](https://nodejs.org) project.

```
some-project/
  scripts/
    app.js
  styles/
    style.css
  templates/
    index.template.html
  .babelrc
  package.json
  webpack.config.js
```

Let's break down all of these files.

**scripts/app.js** -- This is our original JavaScript file, without any modifications (yet).

**styles/style.css** -- This is our original `style.css` file, without any modifications (yet).

**templates/index.template.html** -- And this is our original `index.html` web page, without any modifications (yet).
