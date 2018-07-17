---
title: "Sparklines in D3.js"
layout: post
date: 2018-07-17
---

A [sparkline](https://en.wikipedia.org/wiki/Sparkline) is a very small chart that shows a value change over some controlling factor, usually time. Sparklines typically do not have axes or labels, and should be self-explanatory given the context of the sparkline.

This is an example sparkline. <span id="sparkline-container"></span> It is a small graphical object, in the body of the page. It is meant to help narrate a story that your data is trying to tell. Creating this sparkline is quite easy.

```js
const sparkline = (container, data, options) => {

    const defaults = {
        scale: {
            x: d3.scaleLinear(),
            y: d3.scaleLinear()
        },
        size: [100, 40],
        style: {
            stroke: "rgb(60, 120, 240)",
            strokeWidth: 1
        },
        value: {
            x: d => d[0],
            y: d => d[1]
        }
    };
    
    // Apply defaults to the given options.
    options = $.extend(true, defaults, options);

    // Add an SVG object to the given container.
    let svg = d3.select(container)
        .append("svg")
        .classed("sparkline", true)
        .classed("sparkline-svg", true)        
        .attr("width", options.size[0])
        .attr("height", options.size[1]);
    
    let g = svg.append("g")
        .classed("sparkline", true)
        .classed("sparkline-group", true);

    let xScale = options.scale.x
        .range([0, options.size[0]])
        .domain(d3.extent(data, options.value.x));

    let yScale = options.scale.y
        .range([options.size[1], 0])
        .domain(d3.extent(data, options.value.y));
    
    // Create the line generator function.
    let line = d3.line()
        .x(d => xScale(options.value.x(d)))
        .y(d => yScale(options.value.y(d)));

    // Finally, draw the path object.
    let path = g.append("path")
        .classed("sparkline", true)
        .classed("sparkline-path", true)
        .datum(data)
        .attr("d", line)
        .style("fill", "none")
        .style("stroke", options.style.stroke)
        .style("stroke-width", options.style.strokeWidth);
    
    return path;

};
```
A copy of this code is [available in Github](https://github.com/jarrettmeyer/jarrettmeyer.github.io/blob/master/assets/js/sparkline.js). Now, go forth and visualize!

<script src="/assets/js/jquery/3.3.1/jquery.min.js"></script>
<script src="/assets/js/d3/5.5.0/d3.js"></script>
<script src="/assets/js/sparkline.js"></script>
