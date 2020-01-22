---
title: "SVG Multiline Text with tspan"
layout: post
date: 2018-06-05
tags: d3js
description:
thumbnail: /assets/images/svg-logo.svg
---

Like anything else with SVG, there is a lot you can do with [text](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/text). In this blog post, I will show you how to handle line breaks.

Suppose we have a block of text that looks like this.

```json
[
    {
        "title": "Sunset Park",
        "author": "Patrick Phillips",
        "text": "The Chinese truck driver\nthrows the rope\nlike a lasso, with a practiced flick"
    }
]
```

If we write this text, as-is, with D3, the newlines (`\n`) will be ignored. The easiest solution is to break the lines into independent [tspan](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/tspan) elements.

We want to produce an output that looks like this.

```html
<svg id="canvas">
    <text x="20" y="20">
        <tspan class="title">Sunset Park</tspan>
        <tspan class="author" x="20" dx="20" dy="25">-- Patrick Phillips</tspan>
        <tspan class="text" x="20" dx="10" dy="22">The Chinese truck driver</tspan>
        <tspan class="text" x="20" dx="10" dy="22">throws the rope</tspan>
        <tspan class="text" x="20" dx="10" dy="22">like a lasso, with a practiced flick</tspan>
    </text>
</svg>
```

By applying a `dy` attribute and resetting the `x` position, we effectively create a line break effect with our text. The rendered output looks like the following.

<svg id="canvas"></svg>

Accomplishing this with [D3.js](https://d3js.org/) requires us to use the `data` function twice. The first `data` operation will loop through every block of text. The second `data` operation will loop through every line. If you need help with D3's `enter`, `exit`, and `merge` functions, check out [my previous post](/2018/06/02/d3js-merge).

```js
// Create a new <text> element for every data element.
let text = canvas
    .selectAll("text")
    .data(data)
    .enter()
    .append("text")
    .attr("x", 20)
    .attr("y", 20);

// Add a <tspan class="title"> for every data element.
text.append("tspan")
    .text(d => d.title)
    .attr("class", "title");

// Add a <tspan class="author"> for every data element.
text.append("tspan")
    .text(d => `-- ${d.author}`)
    .attr("class", "author")
    .attr("x", 20)
    .attr("dx", 20)
    .attr("dy", 25);

// Add a <tspan class="text"> for every text line.
text.selectAll("tspan.text")
    .data(d => d.text.split("\n"))
    .enter()
    .append("tspan")
    .attr("class", "text")
    .text(d => d)
    .attr("x", 20)
    .attr("dx", 10)
    .attr("dy", 22);
```

This works because the `data` function allows to enter into embedded attributes and create new arrays from the original data set. In our case, our new array is `d.text.split(\n)`.

The code for this page is available [on Github](https://github.com/jarrettmeyer/jarrettmeyer.github.io/blob/master/assets/js/text1.js).

<script src="https://unpkg.com/d3@5.4.0/dist/d3.min.js"></script>
<script src="/assets/js/text1.js"></script>
