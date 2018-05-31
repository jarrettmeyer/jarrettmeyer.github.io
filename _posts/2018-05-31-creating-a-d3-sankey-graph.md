---
title:    "Creating a Sankey Graph with D3.js"
layout:   post
date:     2018-05-31
---

A [Sankey graph](https://en.wikipedia.org/wiki/Sankey_diagram) is a powerful data visualization that show how elements flow from one state to another in both state and quantity.

<svg id="canvas"></svg>

<script src="https://unpkg.com/d3@5.4.0/dist/d3.min.js"></script>
<script src="https://unpkg.com/d3-sankey@0.7.1/build/d3-sankey.js"></script>
<script src="/assets/js/sankey1.js"></script>

As with most things, we start with a data set. In this case, we have a list of nodes and a list links. A node needs to, at least, have an `index` or `id`, or some property to uniquely identify the node. Links have three properties: a `source`, a `target`, and a `value`. The `source` and `target` are pointers to the appropriate nodes. The `value` is the number of items that traveled that path.

```js
let data = {
    nodes: [
        { id: "A1" },
        { id: "A2" },
        /* snip */
    ],
    links = [
        { source: "A1", target: "B1", value: 27 }
    ]
};
```

Next, we create a `sankey` instance. This creates a function that can be used to generate our Sankey data.

```js
const sankey = d3.sankey()
                 .size([width, height])
                 .nodeId(d => d.id)
                 .nodeWidth(20)
                 .nodePadding(10)
                 .nodeAlign(d3.sankeyCenter);
let graph = sankey(data);
```

Next, we can draw the nodes and the links. Links are paths, and nodes are rectangles.

```js
let links = svg.append("g")
               .classed("links", true)
               .selectAll("path")
               .data(graph.links)
               .enter()
               .append("path")
               .classed("link", true)
               .attr("d", d3.sankeyLinkHorizontal())
               .attr("fill", "none")
               .attr("stroke", "#606060")
               .attr("stroke-width", d => d.width)
               .attr("stoke-opacity", 0.5);

let nodes = svg.append("g")
               .classed("nodes", true)
               .selectAll("rect")
               .data(graph.nodes)
               .enter()
               .append("rect")
               .classed("node", true)
               .attr("x", d => d.x0)
               .attr("y", d => d.y0)
               .attr("width", d => d.x1 - d.x0)
               .attr("height", d => d.y1 - d.y0)
               .attr("fill", "blue")
               .attr("opacity", 0.8);
```

That's the basics of how a Sankey graph works in D3. Any other features, including moving the nodes or applying colors, is beyond the scope of this blog post. The full code for the graph in this document is [available here](/assets/js/sankey1.js).
