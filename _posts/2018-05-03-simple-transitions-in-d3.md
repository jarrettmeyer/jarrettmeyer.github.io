---
title:    "Simple Transitions in D3"
layout:   post
date:     2018-05-03
---

<script type="text/javascript" src="https://d3js.org/d3.v5.js"></script>

The [D3](https://d3js.org) JavaScript library has a very simple mechanism for transitions and animations. Like all good blog posts, let's start with an example. First, let's add an `svg` -- scalable vector graphic -- object to our DOM.

```html
<svg id="canvas" width="400" height="200" style="background-color:lightgray;"></svg>
```

<svg id="canvas1" width="400" height="200" style="background-color:lightgray;"></svg>

Next, let's add a circle to this canvas. That's done with the `circle` tag.

```js
var svg = d3.select("#canvas");
var circle = svg.append("circle")
    .attr("cx", 50)
    .attr("cy", 100)
    .attr("r", 25)
    .attr("fill", "steelblue");
```

<svg id="canvas2" width="400" height="200" style="background-color:lightgray;"></svg>
<script>
(function () {
    var svg = d3.select("#canvas2");
    var circle = svg.append("circle")
        .attr("cx", 50)
        .attr("cy", 100)
        .attr("r", 25)
        .attr("fill", "steelblue");
})();
</script>

To make a transition happen, we just change the attribute we want to change. Let's add a click event listener. When the user clicks on the circle, move the circle.

```js
var diff = 300;
circle.on("click", function () {
    // Capture the current center of the circle. By default, all attributes are
    // returned as strings, so the leading + will ensure that our value gets
    // converted into a number.
    var cx = +circle.attr("cx");
    cx += diff;
    circle.transition()
        .attr("cx", cx);
    diff = -1 * diff;
});
```

<svg id="canvas3" width="400" height="200" style="background-color:lightgray;"></svg>
<script>
(function () {
    var svg = d3.select("#canvas3");
    var circle = svg.append("circle")
        .attr("cx", 50)
        .attr("cy", 100)
        .attr("r", 25)
        .attr("fill", "steelblue");
    var diff = 300;
    circle.on("click", function () {
        var cx = +circle.attr("cx");
        cx += diff;
        circle.transition()
            .attr("cx", cx);
        diff = -1 * diff;
    });
})();
</script>

*To demonstrate the transition, click on the circle above.*

From here, we can modify our [transition properties](https://github.com/d3/d3-transition). For our example, let's make the transition take 3 seconds and use [linear easing](https://github.com/d3/d3-ease).

```js
circle.on("click", function () {
    var tr = d3.transition()
        .duration(3000)
        .ease(d3.easeLinear);
    var cx = +circle.attr("cx");
    cx += diff;
    circle.transition(tr)
        .attr("cx", cx);
    diff = -1 * diff;
});
```

<svg id="canvas4" width="400" height="200" style="background-color:lightgray;"></svg>
<script>
(function () {
    var svg = d3.select("#canvas4");
    var circle = svg.append("circle")
        .attr("cx", 50)
        .attr("cy", 100)
        .attr("r", 25)
        .attr("fill", "steelblue");
    var diff = 300;
    circle.on("click", function () {
        var tr = d3.transition()
            .duration(3000)
            .ease(d3.easeLinear);
        var cx = +circle.attr("cx");
        cx += diff;
        circle.transition(tr)
            .attr("cx", cx);
        diff = -1 * diff;
    });
})();
</script>

And that's it! That's the basics of transitions in D3. Yes, you can make things much more complicated, but everything is a variation of this. You wait for some event -- a user interaction (like a click), a data change, whatever -- and you change the attributes of a graphical element. You can change locations, sizes, colors, opacity (transparency), or any other value you can imagine.
