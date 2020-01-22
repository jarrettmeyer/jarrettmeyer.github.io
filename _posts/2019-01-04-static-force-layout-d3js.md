---
layout: post
title: "Static Force Layout with D3.js"
date: 2019-01-04
tags: d3js javascript
description:
thumbnail: /assets/images/d3js-logo.svg
---

I have been doing a lot of work with force-directed graphs (FDGs) and [D3.js](https://d3js.org) for the past few months. In my latest assignment, I was asked to _not_ animate the graph. The visual rendering takes a while for the graph to settle, and all of the nodes flying around for the first few seconds doesn't add anything to the visualization conversation.

Click the radio buttons below to see the difference in render times. The animated version should be around 5,000 - 6,000 ms; the static version should be 50 ms or less. You can also generate new data with the given button.

Animate?
<label><input type="radio" name="input-animate" value="1"> Yes</label>
<label><input type="radio" name="input-animate" value="0"> No</label>

Animation duration: <span id="animation-duration" style="color: #900;">-----</span>

<button type="button" id="generate-new-data">Generate New Data</button>

<svg id="canvas" width="720" height="480" style="border: 1px solid #ccc;"></svg>

The code to make this work follows.

```js
let canvas = d3.select("#canvas");
let width = +canvas.attr("width");
let height = +canvas.attr("height");

function draw() {
    // Draw links.
    canvas
        .selectAll("line")
        .data(data.links)
        .enter()
        .append("line")
        .attr("stroke", "#999")
        .attr("stroke-opacity", 0.6)
        .attr("stroke-width", d => d.weight)
        .attr("x1", d => d.source.x)
        .attr("x2", d => d.target.x)
        .attr("y1", d => d.source.y)
        .attr("y2", d => d.target.y);

    // Draw nodes.
    canvas
        .selectAll("circle")
        .data(data.nodes)
        .enter()
        .append("circle")
        .attr("fill", d => d.color)
        .attr("r", d => Math.sqrt(d.size) * DEFAULT_RADIUS)
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);
}

function generateNewData() {
    // Reset the data object back to its empty state.
    data.nodes = [];
    data.links = [];

    // Create nodes.
    for (let i = 0; i < NUMBER_OF_NODES; i++) {
        let node = {
            index: i,
            color: d3.interpolateRainbow(i / NUMBER_OF_NODES),
            size: Math.floor(randBetween(MIN_NODE_SIZE, MAX_NODE_SIZE))
        };
        data.nodes.push(node);
    }

    // Create links.
    for (let i = 0; i < NUMBER_OF_NODES; i++) {
        for (let j = i + 1; j < NUMBER_OF_NODES; j++) {
            if (Math.random() < PROBABILITY_OF_LINK) {
                let minSize = Math.min(data.nodes[i].size, data.nodes[j].size);
                let link = {
                    source: data.nodes[i],
                    target: data.nodes[j],
                    weight: Math.floor(randBetween(1, minSize))
                };
                data.links.push(link);
            }
        }
    }

    return data;
}

/**
 * Is the graph animated?
 *
 * Defines if the graph is animated based on which radio button is checked.
 */
function isAnimated() {
    let val = +$("input[name=input-animate]:checked").val();
    return val === 1;
}

/**
 * Generate a random number between given min and max values.
 *
 * @param {number} min
 * @param {number} max
 */
function randBetween(min, max) {
    return min + (max - min) * Math.random();
}

/**
 * Simulate forces.
 */
function simulate() {
    // Remove all existing elements from the canvas.
    canvas.selectAll("*").remove();

    // Capture the start time.
    let startTime = +Date.now();

    // Create a new force simulation and assign forces.
    let simulation = d3
        .forceSimulation(data.nodes)
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force(
            "collide",
            d3.forceCollide(d => d.size)
        )
        .force(
            "link",
            d3.forceLink(data.links).strength(d => Math.sqrt(d.weight))
        )
        .force("manyBody", d3.forceManyBody());

    if (isAnimated()) {
        simulateAnimated(simulation, startTime);
    } else {
        simulateStatic(simulation, startTime);
    }
}

function simulateAnimated(simulation, startTime) {
    draw();
    simulation.on("tick", () => {
        // Update links.
        canvas
            .selectAll("line")
            .attr("x1", d => d.source.x)
            .attr("x2", d => d.target.x)
            .attr("y1", d => d.source.y)
            .attr("y2", d => d.target.y);

        // Update nodes.
        canvas
            .selectAll("circle")
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);
    });

    // Update the timer.
    simulation.on("end", () => {
        updateDuration(startTime);
    });
}

function simulateStatic(simulation, startTime) {
    simulation.stop();

    while (simulation.alpha() > simulation.alphaMin()) {
        simulation.tick();
    }

    // The simulation has been completed. Draw the final product and update the timer.
    draw();
    updateDuration(startTime);
}
```

A demo project is [available in Github]().

<script src="https://unpkg.com/jquery@3.3.1/dist/jquery.min.js"></script>
<script src="https://unpkg.com/d3@5.7.0/dist/d3.min.js"></script>
<script src="/assets/js/static-force-layout.js"></script>
