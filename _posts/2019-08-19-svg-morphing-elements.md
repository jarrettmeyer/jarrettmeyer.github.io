---
title: SVG Morphing Elements
layout: post
date: 2019-08-19
tags: d3js javascript
description: Use SVG paths to transform between shapes
thumbnail: /assets/images/svg-logo.svg
---

On a recent project, I was asked to transform a traditional graph to something with a little more visual appeal. I would like to share how I accomplished that, and what the solution looks like.

<svg id="canvas-001"></svg>

Your first goal is to treat everything like a path. Instead of thinking in pre-defined SVG shapes (e.g. [circle](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/circle), [rect](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/rect), etc.), you need to think about creating [paths](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/path).

Defining a closed path is really easy.

```svg
<path d="M10,10L100,10L100,40L10,40Z" fill="black" stroke="none"></path>
```

The path is just a series of instructions.

1. (M) Move to (10, 10).
2. (L) Line to (100, 10).
3. (L) Line to (100, 40).
4. (L) Line to (10, 40).
5. (Z) Close the path.

That's really it. We need to make a few modifications, but that should be expected. In our case, we're going to need a lot more points. That's because the other shape is a circle, and more points means a better resolution. The number of path points needs to be the same in the shapes we want to draw. Keeping the number of points the same is what allows D3 to create a smooth transition between shapes.

First, let's show what the circle looks like. The one trick that we have here is that we want to start drawing from the top left of the circle, or the point in <span color="darkred">red</span> in the image below. That means the bounds for our index are going to go from $$ -\frac{3}{8} $$ to $$ +\frac{5}{8} $$.

<svg width="200" height="200" viewBox="0 0 200 200"><circle cx="100" cy="100" r="50" fill="darkgray" stroke="none"></circle><circle cx="64.645" cy="64.645" r="5" fill="darkred" stroke="none"></circle></svg>

```js
function toCircle(cx, cy, r, n) {
    let circle = [];
    let i0 = (-3 / 8) * n;
    let i1 = (5 / 8) * n;
    for (let i = i0; i < i1; i++) {
        circle.push([cx + r * Math.cos((i / n) * 2 * Math.PI), cy + r * Math.sin((i / n) * 2 * Math.PI)]);
    }
    return circle;
}
```

Next, we need to define our rectangle. It is much more straightforward than the circle.

```js
function toRectangle(left, top, width, height, n) {
    let rect = [];
    let n4 = n / 4;
    let dx = (dy = 0);
    let x = left;
    let y = top;
    for (let s = 0; s < 4; s++) {
        if (s === 0) {
            dx = width / n4;
            dy = 0;
        } else if (s === 1) {
            dx = 0;
            dy = height / n4;
        } else if (s === 2) {
            dx = -width / n4;
            dy = 0;
        } else {
            dx = 0;
            dy = (-1 * height) / n4;
        }
        for (let i = 0; i < n4; i++) {
            rect.push([x, y]);
            x += dx;
            y += dy;
        }
    }
    return rect;
}
```

Finally, we need a function to turn an array of coordinates into a path. Again, this is very trivial.

```js
function toPath(coordinates) {
    return "M" + coordinates.map(c => `${c[0]},${c[1]}`).join("L") + "Z";
}
```

The remainder of this demonstration is really basic D3 drawing and transitions. You can find the complete code for this demo [in Github](https://github.com/jarrettmeyer/jarrettmeyer.github.io/blob/master/assets/js/morphing-001.js).

<script src="https://unpkg.com/d3@5.9.7/dist/d3.min.js"></script>
<script src="/assets/js/morphing-001.js"></script>
