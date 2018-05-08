---
title:    "Paths in D3 - Part 2"
layout:   post
date:     2018-05-08
---

<script type="text/javascript" src="https://d3js.org/d3.v5.js"></script>

In [my last post](/2018/05/04/paths-in-d3), I gave a demonstration of drawing [paths in D3](https://github.com/d3/d3/blob/master/API.md#paths-d3-path). There are a few tricks to understand how to make good quality graphing with D3 that may not be completely intuitive.

Again, let's start with our basic SVG canvas object.

```html
<svg id="canvas" width="400" height="200" style="background-color:lightgray;"></svg>
```
<svg id="canvas" width="400" height="200" style="background-color:lightgray;"></svg>

Let's grab our SVG object, and let's capture the width and height values.

```js
var svg = d3.select("#canvas");
var width = +svg.attr("width");
var height = +svg.attr("height");
```

Next, we're going to manually add a path by mapping out its coordinates. We will set the `fill` to `none`, so that we only get a line.

```js
var path = svg.append("path")
    .attr("fill", "none")
    .attr("stroke", "mediumblue")
    .attr("strokewidth", 4)
    .attr("d", "M0,100L100,50L200,175L300,75L400,150");
```

<svg id="canvas1" width="400" height="200" style="background-color:lightgray;"></svg>
<script>
(function () {
    var svg = d3.select("#canvas1");
    var width = +svg.attr("width");
    var height = +svg.attr("height");
    var path = svg.append("path")
        .attr("fill", "none")
        .attr("stroke", "mediumblue")
        .attr("stroke-width", 4)
        .attr("d", "M0,100L100,50L200,175L300,75L400,150");
})();
</script>

If we don't explicitly add the `fill: none` attribute, this is what D3 will draw. You'll notice that D3 connects the first and last points and colors in the gaps with the default pen.

<svg id="canvas2" width="400" height="200" style="background-color:lightgray;"></svg>
<script>
(function () {
    var svg = d3.select("#canvas2");
    var width = +svg.attr("width");
    var height = +svg.attr("height");
    var path = svg.append("path")        
        .attr("stroke", "mediumblue")
        .attr("stroke-width", 4)
        .attr("d", "M0,100L100,50L200,175L300,75L400,150");
})();
</script>

Often, when producing a graphic, we want to color the area below the line, but not the area above the line. We can do this by adding two more data points. One point would be the bottom-left corner, and the other would be the bottom-right corner.

```js
var path = svg.append("path")
    .attr("fill", "lightblue")
    .attr("stroke", "mediumblue")
    .attr("stroke-width", 4)
    .attr("d", "M0,100L100,50L200,175L300,75L400,150L400,200L0,200");
```

<svg id="canvas3" width="400" height="200" style="background-color:lightgray;"></svg>
<script>
(function () {
    var svg = d3.select("#canvas3");
    var width = +svg.attr("width");
    var height = +svg.attr("height");
    var path = svg.append("path")
        .attr("fill", "lightblue")
        .attr("stroke", "mediumblue")
        .attr("stroke-width", 4)
        .attr("d", "M0,100L100,50L200,175L300,75L400,150L400,200L0,200");
})();
</script>

This looks pretty good, and our fill area is light blue as expected, but you'll notice that we have some extra lines now, along the right and bottom borders.

The solution to this is to have two separate path objects. The first object will be the area; the second will be the line.

```js
var area = svg.append("path")
    .attr("fill", "lightblue")
    .attr("stroke", "none")    
    .attr("d", "M0,100L100,50L200,175L300,75L400,150L400,200L0,200");
```

<svg id="canvas4" width="400" height="200" style="background-color:lightgray;"></svg>
<script>
(function () {
    var svg = d3.select("#canvas4");
    var width = +svg.attr("width");
    var height = +svg.attr("height");
    var area = svg.append("path")
        .attr("fill", "lightblue")
        .attr("stroke", "none")
        .attr("d", "M0,100L100,50L200,175L300,75L400,150L400,200L0,200");
    var line = svg.append("path")
        .attr("fill", "none")
        .attr("stroke", "mediumblue")
        .attr("stroke-width", 4)
        .attr("d", "M0,100L100,50L200,175L300,75L400,150");
})();
</script>

There, that's much better looking. One more thing: we probably won't ever directly edit the `d` attribute of a path. Instead, we will use D3's `datum()` function. Usually, we will start with our line data. Remember, to create our area data, we just need to add two additional data points.

```js
// Our line is the default generator.
var lineGenerator = d3.line();

// Create the line data as [x, y] pairs.
var lineData = [[0, 100], [100, 50], [200, 175], [300, 75], [400, 150]];

// Create a copy of the line data and add two data points.
var areaData = lineData.slice();
areaData.push([400, 200]);
areaData.push([0, 200]);

// Draw the area using the datum() function and the lineGenerator.
var area = svg.append("path")
    .attr("fill", "lightblue")
    .attr("stroke", "none")    
    .datum(areaData)
    .attr("d", lineGenerator);

// Draw the line using the datum() function and the lineGenerator.
var line = svg.append("path")
    .attr("fill", "none")
    .attr("stroke", "mediumblue")
    .attr("stroke-width", 4)
    .datum(lineData)
    .attr("d", lineGenerator);
```

<svg id="canvas5" width="400" height="200" style="background-color:lightgray;"></svg>
<script>
(function () {
    var svg = d3.select("#canvas5");
    var width = +svg.attr("width");
    var height = +svg.attr("height");
    var lineGenerator = d3.line();
    var lineData = [[0, 100], [100, 50], [200, 175], [300, 75], [400, 150]];
    var areaData = lineData.slice();
    areaData.push([400, 200]);
    areaData.push([0, 200]);
    var area = svg.append("path")
        .attr("fill", "lightblue")
        .attr("stroke", "none")
        .datum(areaData)
        .attr("d", lineGenerator);
    var line = svg.append("path")
        .attr("fill", "none")
        .attr("stroke", "mediumblue")
        .attr("stroke-width", 4)
        .datum(lineData)
        .attr("d", lineGenerator);
})();
</script>

And that's it. Go forth and create those pretty graphics!
