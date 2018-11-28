---
title:              "D3: Moving Bubbles"
layout:             page
permalink:          /projects/d3/moving-bubbles
exclude_from_nav:   true
---

A [moving bubbles plot](https://flowingdata.com/2017/05/17/american-workday/) shows state changes over time. Each focus represents a state. Each node represents an object being tracked. As the state changes, the color changes and the node moves to its new focus.

I wrote this example, because so many have been written using earlier versions of D3. This example is written with version 5.7.0. Let's start by creating the foci and the nodes.

```js
let foci = {};
for (let i = 0; i < fociCount; i++) {
    let angle = 2 * Math.PI / fociCount * i;
    let focus = {
        index: i,
        color: d3.interpolateRainbow(i / fociCount),
        x: center.x + centerRadius * Math.cos(angle),
        y: center.y + centerRadius * Math.sin(angle)
    };
    foci[i] = focus;
}

let nodes = [];
for (let i = 0; i < nodeCount; i++) {
    let focus = pickRandom(foci);
    let node = {
        index: i,
        focus: focus.index,
        radius: 5,
        x: randBetween(0, WIDTH),
        y: randBetween(0, HEIGHT)
    };
    nodes.push(node);
}
```

Define the SVG element.

```js
svg = d3.select("#canvas")
    .attr("width", WIDTH + 2 * MARGIN)
    .attr("height", HEIGHT + 2 * MARGIN)
    .style("border", "1px solid #c0c0c0")
    .append("g")
    .attr("class", "margin")
    .attr("transform", `translate(${MARGIN}, ${MARGIN})`);
```

Define the simulation.

```js
simulation = d3.forceSimulation(nodes)
    .force("charge", d3.forceManyBody().strength(-10).distanceMin(5))
    .force("collide", d3.forceCollide(5))
    .force("position-x", d3.forceX(d => foci[d.focus].x).strength(0.1))
    .force("position-y", d3.forceY(d => foci[d.focus].y).strength(0.1))
    .on("tick", onSimulationTick);
```

The rest of the code is pretty routine stuff, so it isn't necessary to list them here. The complete code for this page is [available in Github](https://github.com/jarrettmeyer/jarrettmeyer.github.io/tree/master/projects/d3/moving-bubbles).

The form elements below let you change the counts and forces applied to the nodes.


<form>
    <div style="margin-bottom: 1em;">
        <label style="display: block;">Number of Foci</label>
        <input type="number" id="foci_count" min="2" max="20" value="5" style="display: block; width: 10em; padding: 3px;">
    </div>
    <div style="margin-bottom: 1em;">
        <label style="display: block;">Foci Strength</label>
        <input type="number" id="foci_strength" min="0" max="10" value="0.05" step="0.01" style="display: block; width: 10em; padding: 3px;">
        <div style="color: #888; font-size: 80%;">Strength of "gravity" for the foci. A higher number means a higher strength.</div>
    </div>
    <div style="margin-bottom: 1em;">
        <label style="display: block;">Number of Nodes</label>
        <input type="number" id="node_count" min="1" max="1000" value="100" style="display: block; width: 10em; padding: 3px;">
    </div>
    <div style="margin-bottom: 1em;">
        <label style="display: block;">Charge Strength</label>
        <input type="number" id="charge_strength" min="-100" max="100" value="-2" style="display: block; width: 10em; padding: 3px;">
        <div style="color: #888; font-size: 80%;">How nodes react to each other. A negative value means nodes repel each other, and a positive value attracts.</div>
    </div>
    
</form>
<svg id="canvas"></svg>

<script src="/assets/js/d3/5.7.0/d3.min.js"></script>
<script src="/projects/d3/moving-bubbles/moving-bubbles.js"></script>
