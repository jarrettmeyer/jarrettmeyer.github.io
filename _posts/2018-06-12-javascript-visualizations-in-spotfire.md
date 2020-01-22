---
title: "JavaScript Visualization in Spotfire"
layout: post
date: 2018-06-12
tags: d3js spotfire
description:
thumbnail: /assets/images/javascript-logo.svg
---

[Tibco Spotfire](https://spotfire.tibco.com/) (version 7.10) has a very powerful JavaScript visualization library. In fact, you can write your charts with any existing JavaScript library - [D3.js](https://d3js.org/), [Google Charts](https://developers.google.com/chart/), [Chart.js](http://www.chartjs.org/), etc. - and have all of the functionality of both Spotfire and your library of choice. There are a few tricks you'll need to learn to get everything to work, through.

### Put Your Visualization in #js_chart

Everything you draw needs to get written to the `#js_chart` element. If you don't put your visualization in that container, there's a good chance it will not work as expected.

```js
const $container = $("#js_chart");
```

### Use the SpotfireLoaded Event

When Spotfire is ready, it sends the `SpotfireLoaded` event to the window.

```js
$(window).on("SpotfireLoaded", e => {
    console.log(e);
    // Put your loading code here.
});
```

Here, we will set up our visualization, fetch data, and anything else we need to do to get started.

### Use Spotfire.read to Get Data

`Spotfire.read` is used to read data from the Spotfire server.

```js
Spotfire.read("data", {}, dataString => {
    let dataObject = JSON.parse(dataString);
    // Put your data manipulation code.
});
```

The data comes in as a string, so we need to use `JSON.parse()`. There is a lot of metadata stored with the data. You'll be interested in the `data` property.

### Use Spotfire.modify to Mark Data

`Spotfire.modify` is used to write data back to the Spotfire server. Importantly, this is used to mark data.

```js
// indices is an array of row indices, e.g. [ 235, 236, 401].
function mark(indices) {
    Spotfire.modify("mark", { indexSet: indices, markMode: "Replace" });
}
```

Hopefully, this helps you get started with JavaScript visualizations in Spotfire.
