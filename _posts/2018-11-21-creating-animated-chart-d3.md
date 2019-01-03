---
title:  "Creating an animated chart in D3"
layout: "post"
date:   2018-11-21
tags:   d3js
---

Yesterday, [I wrote about creating an animated GIF with R](/2018/11/20/creating-animated-gif-r). Today, I am following up with the same thing, this time written with [D3](https://d3js.org).

As usual, the first thing we need to do is to define some constants and get our data values.

```js
let margin = {
    bottom: 20,
    left: 120,
    right: 25,
    top: 20
};
let canvas = d3.select("#bar-chart");
let width = +canvas.attr("width");
let height = +canvas.attr("height");

// Get the sources and years from the data set.
let sources = data.map(row => row.source).reduce(reduceUnique, []);
let years = data.map(row => row.year).reduce(reduceUnique, []);

// Create a dictionary of colors by cost source.
let color = {};
sources.forEach((source, index) => {
    color[source] = d3.schemeSet2[index];
});
```

We also need to be able to filter the data for the current year. This is a simple data manipulation step.

```js
let index = 0;
let yearData = data.filter(d => d.year === years[index]);
draw(yearData);
```

As you may have guessed, the drawing happens in the `draw` function. We will use our trusted [enter/merge/exit pattern](/2018/06/02/d3js-merge) for navigating the data changes.

```js
function draw(data) {
    let gData = canvas.select("g.data");
    if (gData.empty()) {
        gData = canvas.append("g")
            .attr("class", "data")
            .attr("transform", `translate(${margin.left}, ${margin.top})`);
    }

    let bars = gData.selectAll("rect").data(data);

    // Add new values.
    bars.enter()
        .append("rect")
        .attr("fill", d => color[d.source])
        .attr("x", 0)
        .attr("y", d => yScale(d.source))
        .attr("height", yScale.bandwidth())
        .attr("width", d => xScale(d.cost));
    
    // Update existing values.
    bars.merge(bars)
        .transition()
        .duration(1000)
        .attr("width", d => xScale(d.cost));

    // Remove deleted values.
    bars.exit().remove();
}
```

The only thing left to do is to loop through the data. The `setInterval` function makes this quite easy.

```js
setInterval(() => {
    yearIndex = (yearIndex === years.length - 1) ? 0 : yearIndex + 1;
    yearData = data.filter(d => d.year === years[yearIndex]);
    draw(yearData);
}, 3000);
```

<svg id="bar-chart" width="720" height="480"></svg>

This code is available in [Github](https://github.com/jarrettmeyer/jarrettmeyer.github.io/blob/master/assets/js/animated-bar-chart.js). Happy visualizing!

<script src="/assets/js/d3/5.7.0/d3.js"></script>
<script src="/assets/js/animated-bar-chart.js"></script>
