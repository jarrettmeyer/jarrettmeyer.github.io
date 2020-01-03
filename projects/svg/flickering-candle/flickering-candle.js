const view = d3.select("#view");
const defs = view.append("defs");

const orange = "#ff6a00";
const orangeYellow = "#ff9224";
const yellowGray = "#58523a";

const background = view.append("rect")
    .classed("background", true)
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", 1600)
    .attr("height", 900)
    .attr("fill", "#101010")
    .attr("stroke", "none")

// Create a group to hold the candle.
const gCandle = view.append("g").classed("candle", true);

const candlestickGradient = defs.append("linearGradient")
    .attr("id", "candlestick-gradient")
    .attr("x1", 0)
    .attr("x2", 0)
    .attr("y1", 0)
    .attr("y2", 1);
candlestickGradient.append("stop")
    .attr("offset", "4%")
    .attr("stop-color", orangeYellow);
candlestickGradient.append("stop")
    .attr("offset", "10%")
    .attr("stop-color", yellowGray);

const candlestickFilter = defs.append("filter")
    .attr("id", "candlestick-filter");
candlestickFilter.append("feGaussianBlur")
    .attr("in", "SourceAlpha")
    .attr("stdDeviation", 3)
candlestickFilter.append("feOffset")
    .attr("dx", 0)
    .attr("dy", 0)
    .attr("result", "offset-blur");
candlestickFilter.append("feFlood")
    .attr("flood-color", orange)
    .attr("flood-opacity", 1);
candlestickFilter.append("feComposite")
    .attr("in2", "offset-blur")
    .attr("operator", "in")
    .attr("result", "shadow-one");

const candlestickFilterMerge = candlestickFilter.append("feMerge");
candlestickFilterMerge.append("feMergeNode")
    .attr("in", "shadow-one");
candlestickFilterMerge.append("feMergeNode")
    .attr("in", "SourceGraphic");

const candleStick = gCandle.append("path")
    .attr("d", "m 780 900 v -490 a 10 10 0 0 1 10 -10 h 20 a 10 10 0 0 1 10 10 v 490 z")
    .attr("stroke", "none")
    .attr("fill", "url(#candlestick-gradient)")
    .attr("filter", "url(#candlestick-filter)");
