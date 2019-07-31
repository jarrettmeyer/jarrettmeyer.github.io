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
let chargeStrength = -4;
let gravityStrength = 0.1;
let data = [];
let nodeRadius = 6;
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
let nodes = null;
let titles = null;

let xScale = null;
let xAxis = null;
let xLabel = null;
let yScale = null;
let yAxis = null;
let yLabel = null;
let forceCenterBy = null;

function applyForceSimulation(location) {
    if (location === forceCenterBy) {
        // Do nothing.
        console.log(`[applyForceSimulation] location === forceCenterBy: ${location}`);
    }
    else if (location === "center" && forceCenterBy !== "center") {
        let center = {
            x: viewWidth / 2,
            y: viewHeight  / 2,
        }
        simulation.stop()
            .nodes(data)
            .force("pos-x", d3.forceX(center.x).strength(gravityStrength))
            .force("pos-y", d3.forceY(center.y).strength(gravityStrength))
            .alpha(1.0)
            .restart();
        forceCenterBy = "center";
    }
    else if (location === "bySex" && forceCenterBy !== "bySex") {
        let posF = {
            x: viewWidth / 3,
            y: viewHeight / 3,
        };
        let posM = {
            x: viewWidth * 2 / 3,
            y: viewHeight * 2 / 3,
        }
        simulation.stop()
            .nodes(data)
            .force("pos-x", d3.forceX(d => d.sex === "F" ? posF.x : posM.x).strength(gravityStrength))
            .force("pos-y", d3.forceY(d => d.sex === "F" ? posF.y : posM.y).strength(gravityStrength))
            .alpha(1.0)
            .restart();
        forceCenterBy = "bySex";
    }
    else {
        console.log(`[applyForceSimulation] location: ${location}, forceCenterBy: ${forceCenterBy}`);
    }
}


function drawNodes() {
    console.log(`[drawNodes] Drawing nodes at random location (${viewWidth}, ${viewHeight}).`);
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
        .attr("opacity", opacity)
        .attr("stroke", "none");
    return nodes;
}


async function getData() {
    let dataset = await d3.csv("/presentations/weight-vs-a1c/dataset.csv");
    let _data = dataset.map(d => {
        let datum = {
            a1c: +d.a1c,
            delta_a1c: -1 * +d.delta_a1c,
            delta_weight: -1 * +d.weight_loss,
            id: d.id,
            index: d.index,
            isDiabetic: +d.a1c > 0.07,
            sex: d.sex,
            weight: +d.weight,
            x: randBetween(0, viewWidth),
            y: randBetween(0, viewHeight),
        };

        datum.isHealthyPostTrial = (datum.a1c + datum.delta_a1c) < 0.07;

        return datum;
    });

    return _data;
}


async function initialize() {
    setDimensions();
    data = await getData();
    drawNodes();
    window.scrollTo(0, 0);

    // Update text elements.
    d3.select("#data-subject-count").text(data.length);
    d3.select("#data-female-count").text(data.filter(d => d.sex === "F").length);
    d3.select("#data-male-count").text(data.filter(d => d.sex === "M").length);

    // Setup and start the scroller.
    let setupArgs = {
        step: "#scrollable .step",
        offset: 0.9,
        debug: debug,
    };
    scroller.setup(setupArgs).onStepEnter(onStepEnter);

    d3.select("#restart-button")
        .on("click", () => {
            window.scrollTo(0, 0);
            restart();
        });
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

        // Remove existing titles from the nodes.
        nodes.transition()
            .duration(duration)
            .attr("fill", "darkgray");

        applyForceSimulation("center");

        if (!titles) {
            titles = nodes.append("title")
            .text(d => [
                `Subject: ${d.id}`
            ].join("\n"));
        }
        break;
    case 1:
        console.log(`(1) Showing sex of subjects.`)
        nodes.transition()
            .duration(duration)
            .attr("fill", d => d.sex === "F" ? "darkred" : "darkblue");

        applyForceSimulation("center");

        titles.text(d => [
            `Subject: ${d.id}`,
            `Sex: ${d.sex}`
        ].join("\n"));
        break;
    case 2:
        console.log(`(2) Grouping nodes by sex.`);
        applyForceSimulation("bySex");
        break;
    case 3:
        console.log(`(3) Drawing nodes by weight.`);
        for (let i = 0; i < data.length; i++) {
            data[i].fx = xScale(data[i].weight);
        }

        // If the simulation is still going, stop it.
        simulation.stop();
        forceCenterBy = null;

        nodes.transition()
            .duration(duration)
            .attr("cx", d => d.fx);

        if (!xAxis) {
            xAxis = svg.append("g")
                .classed("axis x-axis", true)
                .attr("transform", `translate(${margin.left},${svgHeight})`)
                .call(d3.axisBottom(xScale).ticks(10, ".1f"));
        }
        if (!xLabel) {
            xLabel = xAxis.append("text")
                .text("Weight (lbs)")
                .attr("text-anchor", "middle")
                .attr("fill", "currentColor")
                .attr("x", viewWidth * 0.5)
                .attr("y", margin.bottom * 0.8);
        }

        xAxis.transition()
            .duration(duration)
            .attr("transform", `translate(${margin.left},${margin.top + viewHeight})`);

        titles.text(d => [
            `Subject: ${d.id}`,
            `Sex: ${d.sex}`,
            `Weight: ${d.weight}`
        ].join("\n"));

        break;
    case 4:
        console.log("(4) Adding A1C to graphic.");
        for (let i = 0; i < data.length; i++) {
            data[i].fy = yScale(data[i].a1c);
        }

        nodes.transition()
            .duration(duration)
            .attr("cy", d => d.fy);

        if (!yAxis) {
            yAxis = svg.append("g")
                .classed("axis y-axis", true)
                .attr("transform", `translate(0,${margin.top})`)
                .call(d3.axisLeft(yScale).ticks(10, ".1%"));
        }
        if (!yLabel) {
            yLabel = yAxis.append("text")
                .text("HbA1C (%)")
                .attr("text-anchor", "middle")
                .attr("fill", "currentColor")
                .attr("transform", "rotate(-90)")
                .attr("x", -0.5 * viewHeight)
                .attr("y", -0.75 * margin.left);
        }
        yAxis.transition()
            .duration(duration)
            .attr("transform", `translate(${margin.left},${margin.top})`);

        titles.text(d => [
            `Subject: ${d.id}`,
            `Sex: ${d.sex}`,
            `Weight: ${d.weight}`,
            `A1C: ${d.a1c}`
        ].join("\n"));

        break;
    case 5:
        console.log("(5) Adjusting the y-axis for subjects having A1C > 0.7%.");

        // Create a new y scale for this data set.
        yScale = yScale
            .domain([0.06999, d3.max(data, d => d.a1c)])
            .range([viewHeight, 0])
            .nice();

        yAxis.transition()
            .duration(duration)
            .call(d3.axisLeft(yScale).ticks(10, ".1%"));

        nodes.transition()
            .duration(duration)
            .attr("cy", d => d.isDiabetic ? yScale(d.a1c) : yScale(0.0))
            .attr("opacity", d => d.a1c < 0.07 ? 0 : opacity);

        break;
    case 6:
        console.log("(6) Adjusting x-axis and y-axis to show deltas.");
        xScale = d3.scaleLinear()
            .domain(d3.extent(data, d => d.delta_weight))
            .range([0, viewWidth])
            .nice();
        yScale = d3.scaleLinear()
            .domain(d3.extent(data, d => d.delta_a1c))
            .range([viewHeight, 0])
            .nice()

        xAxis.transition()
            .duration(duration)
            .call(d3.axisBottom(xScale).ticks(10, ".1f"));

        xLabel.text("Change in Weight (lbs)");

        yAxis.transition()
            .duration(duration)
            .call(d3.axisLeft(yScale).ticks(10, ".1%"));

        yLabel.text("Change in HbA1C (%)");

        nodes.transition()
            .duration(duration)
            .attr("cx", d => xScale(d.delta_weight))
            .attr("cy", d => yScale(d.delta_a1c))
            .attr("stroke", d => d.isHealthyPostTrial ? "darkgreen" : "none")
            .attr("stroke-width", d => d.isHealthyPostTrial ? nodeRadius/2 : 0)
            .attr("stroke-opacity", d => d.isHealthyPostTrial ? 1 : 0);

        titles.text(d => [
            `Subject: ${d.id}`,
            `Sex: ${d.sex}`,
            `Weight: ${d.weight} (${d.delta_weight})`,
            `A1C: ${d.a1c} (${d.delta_a1c})`
        ].join("\n"));

        break;
    }
}

function randBetween(min, max) {
    let range = max - min;
    return min + range * Math.random();
}

function restart() {
    window.location.reload();
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
