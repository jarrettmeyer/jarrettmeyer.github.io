---
layout:     post
title:      "Understanding SVG Stroke and Fill"
date:       2019-04-17
tag:        d3js
---

This is quick little demo to show you how stroke and fill work with SVG objects. Let's start by drawing two identical squares.

<svg width="400" height="160">
    <rect x="10" y="20" width="100" height="100" fill="blue"></rect>
    <rect x="140" y="20" width="100" height="100" fill="darkblue"></rect>
</svg>

Now, to the second square, let's add a stroke with width 20.

<svg width="400" height="160">
    <rect x="10" y="20" width="100" height="100" fill="blue"></rect>
    <rect x="140" y="20" width="100" height="100" fill="darkblue" stroke="red" stroke-width="20"></rect>
</svg>

We kept the size of the square the same, but the inner square got a little smaller. This is because the stroke applies itself evenly to the outer edge of the square, with half the stroke (10) inside the square and half the stroke outside the square. We can verify this by drawing a third square that has the same area (`width` + `stroke-width` / 2) x `height` + `stroke-width` / 2) as the second square.

<svg width="400" height="160">
    <rect x="10" y="20" width="100" height="100" fill="blue"></rect>
    <rect x="140" y="20" width="100" height="100" fill="darkblue" stroke="red" stroke-width="20"></rect>
    <rect x="270" y="10" width="120" height="120" fill="purple"></rect>
</svg>

The third square, in purple, has the same outer dimensions as the second square.

I hope this helps. Now, go forth and visualize!
