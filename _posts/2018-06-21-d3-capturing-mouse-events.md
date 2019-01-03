---
title:      "Capturing Mouse Events in D3.js"
layout:     post
date:       2018-06-21
tags:       d3js
---

[D3.js](https://d3js.org/) provides some pretty decent tooling for [working with the mouse](https://github.com/d3/d3-selection/blob/master/README.md#handling-events). This post will give an example of how those work.

- `mouseenter`: Fires when the mouse enters the canvas.
- `mouseleave`: Fires when the mouse leaves the canvas.
- `mousemove`: Fires on any mouse movement over the canvas.
- `mouseout`: Fires when the mouse leaves the canvas or any of its children.
- `mouseover`: Fires when the mouse enters the canvas or any of its children.

In the example below, the green `<rect>` is a child of the parent `<svg>`.

<svg id="canvas"></svg> 
<script src="/assets/js/d3/5.5.0/d3.js"></script>
<script src="/assets/js/mouse-hit.js"></script>

The `mousemove` event is certainly the simplest. Any time the mouse is moving over the target, the `mousemove` event is firing. To get the mouse position relative to the target, use `d3.mouse(d3.event.target)`.

When the mouse crosses from the `<body>` to the `<svg>`, the `mouseenter` and `mouseover` events will fire. When the mouse crosses from the `<svg>` to the `<rect>`, the `mouseout` and `mouseover` events will fire. When the mouse crosses from the `<svg>` back to the `<body>`, the `mouseleave` and `mouseout` events will fire.

This code for this demo is [available on Github](https://github.com/jarrettmeyer/jarrettmeyer.github.io/blob/master/assets/js/mouse-hit.js).
