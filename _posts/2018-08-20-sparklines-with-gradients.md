---
title: "D3: Sparklines with Gradients"
layout: post
date: 2018-08-20
tags: d3js
description:
thumbnail: /assets/images/d3js-logo.svg
---

I have already put together a post on [Sparklines in D3](/2018/07/17/sparklines-in-d3). I was recently asked to put together a sparkline, but to apply the same [Viridis color palette](/2018/08/07/viridis-color-palette) that the rest of the graphic uses. The sparkline should look something like this.

<div id="sparkline-container" style="margin-left: auto; margin-right: auto; width: 300px; border: 1px solid #ccc;"></div>

Fortunately, this is quite easy to pull off with [D3](https://d3js.org). First, we need to create a gradient.

```js
let gradientId = null;
if (options.gradient) {
    gradientId = "linear-gradient-" + Math.floor(Math.random() * 1e9);
    let gradient = svg
        .append("defs")
        .append("linearGradient")
        .attr("id", gradientId)
        .attr("x1", "0%")
        .attr("x2", "0%")
        .attr("y1", "100%")
        .attr("y2", "0%");
    let stops = [0, 0.25, 0.5, 0.75, 1.0];
    gradient
        .selectAll("stop")
        .data(stops)
        .enter()
        .append("stop")
        .attr("offset", d => Math.floor(d * 100) + "%")
        .attr("stop-color", d => options.gradient(d));
}
```

This will produce a gradient definition like the following.

```html
<defs>
    <linearGradient id="linear-gradient-581969908" x1="0%" x2="0%" y1="100%" y2="0%">
        <stop offset="0%" stop-color="#440154"></stop>
        <stop offset="25%" stop-color="#3b528b"></stop>
        <stop offset="50%" stop-color="#21918c"></stop>
        <stop offset="75%" stop-color="#5ec962"></stop>
        <stop offset="100%" stop-color="#fde725"></stop>
    </linearGradient>
</defs>
```

To apply this gradient to our sparkline, we reference the `id` for the path's stroke property.

```js
.attr("stroke", () => { return options.gradient ? `url(#${gradientId})` : options.style.stroke })
```

This produces the following SVG HTML element.

```html
<path class="sparkline sparkline-path" d="..." fill="none" stroke="url(#linear-gradient-581969908)" stroke-width="1"></path>
```

If no gradient is given, then the sparkline will fallback to using the given stroke value.

This code is [available in Github](https://github.com/jarrettmeyer/jarrettmeyer.github.io/blob/master/assets/js/colorscale-sparkline.js).

<script src="/assets/js/jquery/3.3.1/jquery.min.js"></script>
<script src="/assets/js/d3/5.5.0/d3.js"></script>
<script src="/assets/js/colorscale-sparkline.js"></script>
