const width = 800;
const height = 600;
const viewBox = [0, 0, width, height];

const stroke = "#303030";
const strokeWidth = 3;
const strokeLineCap = "round";

const svg = d3.select("#problem-1")
    .attr("viewBox", viewBox.join(" "));

const lines = [
    { x1: 200, y1: 500, x2: 700, y2: 500 },
    { x1: 200, y1: 350, x2: 700, y2: 250 },
    { x1: 400, y1: 500, x2: 364, y2: 318 },
    { x1: 600, y1: 500, x2: 554, y2: 280 },
    { x1: 400, y1: 500, x2: 554, y2: 280 },
    { x1: 600, y1: 500, x2: 364, y2: 318 },
];

svg.selectAll("line")
    .data(lines)
    .join("line")
    .attr("x1", d => d.x1)
    .attr("y1", d => d.y1)
    .attr("x2", d => d.x2)
    .attr("y2", d => d.y2)
    .attr("stroke", stroke)
    .attr("stroke-width", strokeWidth)
    .attr("stroke-linecap", strokeLineCap);
