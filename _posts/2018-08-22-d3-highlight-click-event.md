---
title:  "D3: Highlight Click Event"
layout: "post"
date:   2018-08-22
tags:   d3js
---

Yesterday, I was asked to add a highlight click event to a point on a screen. For a quick demo of this effect, click the point below.

<div id="canvas-container" style="width: 300px; margin-left: auto; margin-right: auto; margin-bottom: 1em; border: 1px solid #333;">
    <svg id="canvas" width="300" height="200"></svg>
</div>

Fortunately, [D3](https://d3js.org) makes this really easy with [transitions](https://github.com/d3/d3-transition).

```js
d3.select(".circle").on("click", onCircleClick);

function onCircleClick() {
    d3.select(d3.event.target)
        .raise()
        .transition()
        .duration(100)
        .attr("r", maxRadius)
        .transition()
        .duration(900)
        .attr("r", radius);
}
```

The code for this blog post is [available in Github](https://github.com/jarrettmeyer/jarrettmeyer.github.io/blob/master/assets/js/click-highlight.js).

<script src="/assets/js/jquery/3.3.1/jquery.min.js"></script>
<script src="/assets/js/d3/5.6.0/d3.js"></script>
<script src="/assets/js/click-highlight.js"></script>
