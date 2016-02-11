---
layout:   post
title:    "Getting Started with MathJax"
date:     2014-08-06
---

I've spent the past few days getting myself reacquainted with TeX and familiarizing myself with [MathJax](http://www.mathjax.org/). As it turns out, it is quite easy to get MathJax working in Octopress.

1. Open `source/_includes/custom/head.html`.
2. Add the a JavaScript source: `//cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-MML-AM_HTMLorMML`.
3. Start typing your TeX.
4. In your `Gemfile`, make sure you are using at least [RDiscount](https://github.com/davidfstr/rdiscount) version 2.1. `gem 'rdiscount', '~> 2.1'`
5. In your `_config.yml` file, disable automatic superscripts by adding `- no_superscript` to your RDiscount configuration.

The last two are quite important. Without those two steps, it looks like RDiscount will turn `x^2` into `x<sup>2</sup>`. This will get displayed as x<sup>2</sup>. That will break the MathJax processor.

Let's start by demonstrating a simple inline equation, like \\( y = mx + c \\). This is simple enough by including the inline text: `\\( y = mx + c \\)`.

To enter full equations, like the one below, use the following syntax.

```
\begin{equation}
x = \dfrac{ -b \pm \sqrt{ b^2 - 4ac } }{ 2a }
\end{equation}
```

The above code will render as the following equation.

\begin{equation}
x = \dfrac{ -b \pm \sqrt{ b^2 - 4ac } }{ 2a }
\end{equation}

Happy mathing!
