//
history.scrollRestoration = "manual";
let debug = false;

let margin = {top: 10, bottom: 40, left: 60, right: 12};
let svgHeight = 100;
let svgWidth = 100;
let viewWidth = 80;
let viewHeight = 80;

scroller = scrollama();

// Define the necessary parts to display our data.
let numNodes = 200;
let numTicks = 100;
let duration = 1000;
let chargeStrength = -3.5;
let gravityStrength = 0.1;
let data = [];
let nodeRadius = 5;
let nodeBuffer = 1;
let opacity = 0.6;
let simulation = d3.forceSimulation()
    .force("charge", d3.forceManyBody().strength(chargeStrength).distanceMin(nodeRadius + nodeBuffer))
    .force("collide", d3.forceCollide(nodeRadius))
    .stop()
    .on("tick", onSimulationTick);

// Grab the main scrollable DOM elements.
let scrollable = d3.select("#scrollable");
let article = scrollable.select("article");
let figure = scrollable.select("figure");
let step = article.selectAll(".step");
let svg = figure.select("svg");

let view = svg.append("g")
    .classed("view", true)
    .attr("transform", `translate(${margin.left},${margin.top})`);
let nodes = view.selectAll("circle.node");

let xScale = null;
let yScale = null;
let xAxis = null;
let yAxis = null;

function drawNodes() {
    console.log(`Drawing nodes at random location (${viewWidth}, ${viewHeight}).`);
    nodes = view.selectAll("circle")
        .data(data)
        .join("circle")
        .classed("node", true)
        .attr("data-weight", d => d.weight)
        .attr("data-a1c", d => d.a1c)
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .attr("r", nodeRadius)
        .attr("fill", "darkgray")
        .attr("opacity", opacity);
    return nodes;
}

async function getData() {
    let dataset = await d3.csv("/presentations/weight-vs-a1c/dataset.csv");
    let _data = dataset.map(d => {
        return {
            a1c: +d.a1c,
            id: d.id,
            index: d.index,
            sex: d.sex,
            weight: +d.weight,
            x: randBetween(0, viewWidth),
            y: randBetween(0, viewHeight),
        };
    });
    return _data;
}

async function initialize() {
    setDimensions();
    data = await getData();
    drawNodes();
    window.scrollTo(0, 0);

    // Setup and start the scroller.
    let setupArgs = {
        step: "#scrollable .step",
        offset: 0.9,
        debug: debug,
    };
    scroller.setup(setupArgs).onStepEnter(onStepEnter);
}

function onSimulationTick() {
    nodes.attr("cx", d => d.x)
        .attr("cy", d => d.y);
}

function onStepEnter(response) {
    console.log(`On step enter: ${response.index} (${response.direction}).`);


    xScale = d3.scaleLinear()
        .domain(d3.extent(data, d => d.weight))
        .range([0, viewWidth])
        .nice();
    yScale = d3.scaleLinear()
        .domain(d3.extent(data, d => d.a1c))
        .range([viewHeight, 0])
        .nice();

    switch (response.index) {
    case 0:
        console.log(`(0) Drawing nodes, centered at ${viewWidth/2}, ${viewHeight/2}`);
        simulation.stop()
            .nodes(data)
            .force("pos-x", d3.forceX(viewWidth / 2).strength(gravityStrength))
            .force("pos-y", d3.forceY(viewHeight / 2).strength(gravityStrength))
            .alpha(1.0)
            .restart();
        nodes.transition()
            .duration(duration)
            .attr("fill", "darkgray");
        break;
    case 1:
        console.log(`(1) Showing sex of subjects.`)
        nodes.transition()
            .duration(duration)
            .attr("fill", d => d.sex === "F" ? "darkred" : "darkblue");
        if (xAxis !== null) {
            xAxis.transition()
                .duration(duration)
                .attr("transform", `translate(${margin.left},${svgHeight})`);
        }
        break;
    case 2:
        console.log(`(2) Drawing nodes by weight.`);
        for (let i = 0; i < data.length; i++) {
            data[i].fx = xScale(data[i].weight);
        }

        simulation.stop();
        nodes.transition()
            .duration(duration)
            .attr("cx", d => d.fx);

        if (!xAxis) {
            xAxis = svg.append("g")
                .classed("axis x-axis", true)
                .attr("transform", `translate(${margin.left},${svgHeight})`);
        }
        xAxis.call(d3.axisBottom(xScale).ticks(10, ".1f"));
        xAxis.append("text")
            .text("Weight (lbs)")
            .attr("text-anchor", "middle")
            .attr("fill", "currentColor")
            .attr("x", viewWidth * 0.5)
            .attr("y", margin.bottom * 0.8);
        xAxis.transition()
            .duration(duration)
            .attr("transform", `translate(${margin.left},${margin.top + viewHeight})`);
        break;
    case 3:
        console.log("(3) Adding A1C to graphic.");
        for (let i = 0; i < data.length; i++) {
            data[i].fy = yScale(data[i].a1c);
        }
        simulation.stop();

        nodes.transition()
            .duration(duration)
            .attr("cy", d => d.fy);

        if (yAxis === null) {
            yAxis = svg.append("g")
                .classed("axis y-axis", true)
                .attr("transform", `translate(0,${margin.top})`);
        }
        yAxis.call(d3.axisLeft(yScale).ticks(10, ".1%"));
        yAxis.append("text")
            .text("HbA1C (%)")
            .attr("text-anchor", "middle")
            .attr("fill", "currentColor")
            .attr("transform", "rotate(-90)")
            .attr("x", -0.5 * viewHeight)
            .attr("y", -0.75 * margin.left);
        yAxis.transition()
            .duration(duration)
            .attr("transform", `translate(${margin.left},${margin.top})`);
        break;
    case 4:
        console.log("(4) Adjusting the y-axis for subjects having A1C > 0.7%.");
        yScale = yScale.domain([0.069, d3.max(data, d => d.a1c)])
            .nice();

        yAxis.transition()
            .duration(duration)
            .call(d3.axisLeft(yScale).ticks(10, ".1%"));

        nodes.transition()
            .attr("cy", d => yScale(d.a1c))
            .attr("opacity", d => d.a1c < 0.07 ? 0 : opacity);

        break;
    }
}

function randBetween(min, max) {
    let range = max - min;
    return min + range * Math.random();
}

function setDimensions() {
    let _figure = figure.node();
    let clientRect = _figure.getBoundingClientRect();
    svgWidth = clientRect.width;
    svgHeight = window.innerHeight * 0.8;
    console.log(`Setting SVG dimensions to ${svgWidth}, ${svgHeight}.`);

    viewHeight = svgHeight - margin.top - margin.bottom;
    viewWidth = svgWidth - margin.left - margin.right;
    view.attr("transform", `translate(${margin.left},${margin.top})`);
    console.log(`Setting g.view dimensions to ${viewWidth}, ${viewHeight}.`);

    let figureTop = (window.innerHeight - svgHeight) / 2;
    figure.style("top", `${figureTop}px`)
        .style("height", `${svgHeight}px`);

    let stepVerticalPadding = window.innerHeight * 0.5;
    step.style("padding-top", `${stepVerticalPadding}px`)
        .style("padding-bottom", `${stepVerticalPadding}px`);

    svg.attr("width", svgWidth)
        .attr("height", svgHeight)
        .attr("viewBox", [0,0,svgWidth,svgHeight]);
}

initialize();
