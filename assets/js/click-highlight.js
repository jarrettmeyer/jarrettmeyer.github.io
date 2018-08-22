let maxRadius = 25;
let radius = 5;
let duration = 1000;
let count_of_circles = 10;

let svg = d3.select("#canvas");
let width = +svg.attr("width");
let height = +svg.attr("height");
let margin = 20;

let circles = [];

for (let i = 0; i < 10; i++) {
    circles.push({
        loc: [
            margin + (width - 2 * margin) * Math.random(),
            margin + (height - 2 * margin) * Math.random()
        ],
        color: d3.interpolateRainbow(i / 10)
    });
}

let center = [width / 2, height / 2];

svg.selectAll(".circle")
    .data(circles)
    .enter()
    .append("circle")
    .classed("circle", true)
    .attr("fill", d => d.color)
    .attr("stroke", "none")
    .attr("cx", d => d.loc[0])
    .attr("cy", d => d.loc[1])
    .attr("r", radius);

d3.selectAll(".circle").on("click", onCircleClick);


function onCircleClick() {
    let target = d3.select(d3.event.target);
    let color = d3.color(target.attr("fill"));
    target.raise()
        .transition()
        .duration(100)
        .attr("r", maxRadius)
        .attr("fill", color.brighter())
        .transition()
        .duration(900)
        .attr("r", radius)
        .attr("fill", color);
}