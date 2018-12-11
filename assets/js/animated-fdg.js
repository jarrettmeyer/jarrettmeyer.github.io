(() => {
    console.log("Loading script");

    // Initialize our constants.
    const CHARGE_STRENGTH_MULTIPLIER = -1;
    const COLLISION_BUFFER = 3;
    const MAX_DURATION = 14;
    const MAX_FONT_SIZE = 10;
    const MAX_NODE_COUNT = 100;
    const MAX_RADIUS = 25;
    const MAX_START = 25;
    const MIN_RADIUS = 4;
    const NODE_DATA_SET = [];
    const SIMULATION_RESTART_ALPHA = 0.3;
    const TICK_INTERVAL = 2000;

    let id = 0;
    let currentTime = 0;
    let maxTime = 0;
    let simulation = null;

    let canvas = d3.select("#canvas");
    let width = +canvas.node().width.baseVal.value;
    let height = +canvas.node().height.baseVal.value;

    console.log(`Width = ${width}, Height = ${height}.`);

    function createDataPoint() {
        let dataPoint = {
            id: ++id,
            color: d3.interpolateRainbow(id / MAX_NODE_COUNT),
            radius: Math.floor(randBetween(MIN_RADIUS, MAX_RADIUS)),
            start: Math.floor(randBetween(1, MAX_START)),
            duration: Math.floor(randBetween(1, MAX_DURATION)),
            x: Math.floor(randBetween(0, width)),
            y: Math.floor(randBetween(0, height))
        };
        return dataPoint;
    }

    function createDataSet() {
        for (let i = 0; i < MAX_NODE_COUNT; i++) {
            let newPoint = createDataPoint();
            newPoint.end = newPoint.start + newPoint.duration;
            NODE_DATA_SET.push(newPoint);

            if (newPoint.end > maxTime) {
                maxTime = newPoint.end + 1;
            }
        }
        console.log(`Max time = ${maxTime}.`);
    }

    function createSimulation() {
        // Set up the forces.
        let collide = d3.forceCollide()
            .radius(d => d.radius + COLLISION_BUFFER);
        let manyBody = d3.forceManyBody()
            .strength(d => d.radius * CHARGE_STRENGTH_MULTIPLIER)
            .distanceMin(d => d.radius);
        let x = d3.forceX(width / 2);
        let y = d3.forceY(height / 2);

        // Create the simulation.
        let simulation = d3.forceSimulation(NODE_DATA_SET)
            .force("collide", collide)
            .force("manyBody", manyBody)
            .force("x", x)
            .force("y", y)
            .on("tick", onSimulationTick);
        return simulation;
    }

    function createTextTimer() {
        let text = canvas.append("text")
            .classed("timer", true)
            .attr("font-family", "sans-serif")
            .attr("font-size", 10)
            .attr("x", 4)
            .attr("y", 16)
            .text(`t = 0`);
        return text;
    }

    function filterData(dataSet, t) {
        return dataSet.filter(d => d.start <= t && t <= d.end);
    }

    function getFontSize(d, factor) {
        if (factor === undefined || factor < 0) {
            factor = 1;
        }
        return factor * Math.min(MAX_FONT_SIZE, 2 * d.radius);
    }

    function onSimulationTick() {
        // Update the nodes.
        canvas.selectAll("circle").attr("cx", d => d.x).attr("cy", d => d.y);

        // Update the labels.
        canvas.selectAll("text.label").attr("x", d => d.x).attr("y", d => d.y);

        // Update the timer.
        canvas.select("text.timer").text(`t = ${currentTime}`);
    }

    function randBetween(min, max) {
        let range = max - min;
        return min + range * Math.random();
    }

    function updateNodes(data) {
        // Rebind the data set to the collection of nodes. Use the .id
        // property to uniquely identify nodes.
        let nodes = canvas.selectAll("circle").data(data, d => d.id);

        // Change the CSS class for all existing nodes.
        nodes.classed("enter", false)
            .classed("update", true)
            .attr("stroke", "none")
            .attr("stroke-width", null);

        nodes.enter()
            .append("circle")
            .classed("enter", true)
            .attr("data-id", d => d.id)
            .attr("fill", d => d.color)
            .attr("cx", d => d.x)
            .attr("cy", d => d.y)
            .attr("r", d => d.radius)
            .attr("stroke", "#ccc")
            .attr("stroke-width", 2);

        nodes.merge(nodes)
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);

        nodes.exit().remove();

        // Grab all of the text elements, too.
        let texts = canvas.selectAll("text.label").data(data, d => d.id);

        texts.classed("enter", false)
            .classed("update", true);

        texts.enter()
            .append("text")
            .classed("enter", true)
            .classed("label", true)
            .attr("text-anchor", "middle")
            .attr("font-size", d => getFontSize(d, 1))
            .attr("x", d => d.x)
            .attr("y", d => d.y)
            .attr("dy", d => getFontSize(d, 0.5))
            .text(d => d.id)

        texts.merge(texts)
            .attr("x", d => d.x)
            .attr("y", d => d.y)

        texts.exit().remove();

        simulation.nodes(data);
        simulation.alpha(SIMULATION_RESTART_ALPHA).restart();

        return nodes;
    }

    createDataSet();

    simulation = createSimulation();
    createTextTimer();

    let data = filterData(NODE_DATA_SET, 0);
    updateNodes(data);

    setInterval(() => {
        currentTime++;
        if (currentTime > maxTime) {
            currentTime = 0;
        }
        let data = filterData(NODE_DATA_SET, currentTime);
        updateNodes(data);

    }, TICK_INTERVAL);

    console.log("Done loading script.");
})();
