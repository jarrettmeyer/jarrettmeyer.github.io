---
title:      "Force-Directed Graph with Changing Nodes"
layout:     "post"
date:       2018-12-07
tags:       ["d3.js"]
---

This week I've been working on an assignment to create a force-directed graph that walks through a data set. As the time progresses, different nodes will enter and exit the graph. This was a pretty fun variance from a typical force-directed graph, so I thought I would share my solution.

We will start by defining our canvas.

```html
<svg id="canvas" style="width: 100%; height: 500px; border: 1px solid #ccc;"></svg>
```

As usual, let's first set up some useful constants. You'll see how these constants are used later on in the code.

```js
// Initialize our constants.
const CHARGE_STRENGTH_MULTIPLIER = -1;
const COLLISION_BUFFER = 3;
const MAX_DURATION = 14;
const MAX_FONT_SIZE = 10;
const MAX_NODE_COUNT = 100;
const MAX_RADIUS = 25;
const MAX_START = 25;
const MIN_RADIUS = 4;
const NODE_DATA_SET = [];
const SIMULATION_RESTART_ALPHA = 0.3;
const TICK_INTERVAL = 2000;
```

We also need to grab the dimensions of our canvas.

```js
let id = 0;
let currentTime = 0;
let maxTime = 0;
let simulation = null;

let canvas = d3.select("#canvas");
let width = +canvas.node().width.baseVal.value;
let height = +canvas.node().height.baseVal.value;
```

Let's create our data set.

```js
function createDataPoint() {
    let dataPoint = {
        id: ++id,
        color: d3.interpolateRainbow(id / MAX_NODE_COUNT),
        radius: Math.floor(randBetween(MIN_RADIUS, MAX_RADIUS)),
        start: Math.floor(randBetween(1, MAX_START)),
        duration: Math.floor(randBetween(1, MAX_DURATION)),
        x: Math.floor(randBetween(0, width)),
        y: Math.floor(randBetween(0, height))
    };
    return dataPoint;
}

function createDataSet() {
    for (let i = 0; i < MAX_NODE_COUNT; i++) {
        let newPoint = createDataPoint();
        newPoint.end = newPoint.start + newPoint.duration;
        NODE_DATA_SET.push(newPoint);

        if (newPoint.end > maxTime) {
            maxTime = newPoint.end + 1;
        }
    }
    console.log(`Max time = ${maxTime}.`);
}

function randBetween(min, max) {
    let range = max - min;
    return min + range * Math.random();
}
```

<svg id="canvas" style="width: 100%; height: 500px; border: 1px solid #ccc;"></svg>

<script src="/assets/js/d3/5.7.0/d3.min.js"></script>
<script src="/assets/js/animated-fdg.js"></script>
