(() => {

    const FOCI_LENGTH = 10;
    const FOCI_STROKE_WIDTH = 2;
    const HEIGHT = 500;
    const INTERVAL_DURATION = 1000;
    const MARGIN = 20;
    const MUTATE_PROBABILITY = 0.02;
    const CIRCLE_RADIUS = 5;
    const WIDTH = 700;

    let center = [WIDTH / 2, HEIGHT / 2];
    let centerRadius = Math.min(WIDTH / 2, HEIGHT / 2) * 0.75;
    let foci = null;
    let fociCount = null;
    let nodeCount = null;
    let nodes = null;
    let simulation = null;
    let svg = null;

    function createFocus(index) {
        let angle = 2 * Math.PI / fociCount * index;
        return {
            index: index,
            angle: angle,
            color: d3.interpolateRainbow(index / fociCount),
            x: center[0] + centerRadius * Math.cos(angle),
            y: center[1] + centerRadius * Math.sin(angle)
        };
    }

    function createPoint(index) {
        let focus = pickRandom(foci);
        return {
            index: index,
            focus: focus.index,
            radius: CIRCLE_RADIUS,
            x: randBetween(0, WIDTH),
            y: randBetween(0, HEIGHT)
        }
    }

    function drawIntersection(focus) {
        let intersectionGroup = svg.append("g")
            .attr("class", "intersection")
            .attr("id", `focus-${focus.index}`)
            .attr("data-angle", focus.angle)
            .attr("data-x", focus.x)
            .attr("data-y", focus.y);
        intersectionGroup.append("line")
            .attr("stroke", focus.color)
            .attr("stroke-width", FOCI_STROKE_WIDTH)
            .attr("x1", focus.x - FOCI_LENGTH)
            .attr("x2", focus.x + FOCI_LENGTH)
            .attr("y1", focus.y)
            .attr("y2", focus.y);
        intersectionGroup.append("line")
            .attr("stroke", focus.color)
            .attr("stroke-width", FOCI_STROKE_WIDTH)
            .attr("x1", focus.x)
            .attr("x2", focus.x)
            .attr("y1", focus.y - FOCI_LENGTH)
            .attr("y2", focus.y + FOCI_LENGTH);
    }

    function onChargeStrengthChange() {
        let chargeStrength = +$("#charge_strength").val();
        simulation.force("charge").strength(chargeStrength);
        startSimulation();
        console.log(`Changing charge strength to ${chargeStrength}.`);
    }

    function onFociCountChange() {
        removeIntersections();
        fociCount = +$("#foci_count").val();
        foci = {};
        for (let i = 0; i < fociCount; i++) {
            let focus = createFocus(i);
            foci[i] = focus;
            drawIntersection(focus);
        }
        updatePointFoci();
        startSimulation();
    }

    function onFociStrengthChange() {
        let fociStrength = +$("#foci_strength").val();
        simulation.force("position-x").strength(fociStrength);
        simulation.force("position-y").strength(fociStrength);
        startSimulation();
        console.log(`Changing foci strength to ${fociStrength}.`);
    }

    function onNodeCountChange() {
        nodes = [];
        nodeCount = +$("#node_count").val();
        for (let i = 0; i < nodeCount; i++) {
            let point = createPoint(i);
            nodes.push(point);
        }
        updateCircles(nodes);
        startSimulation();
        return nodes;
    }

    function onSimulationTick() {
        svg.selectAll("circle")
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);
    }

    function pickRandom(list) {
        let index = -1;
        if (Array.isArray(list)) {
            index = Math.floor(randBetween(0, list.length));
        }
        else {
            let keys = Object.keys(list);
            index = Math.floor(randBetween(0, keys.length));
        }
        return list[index];
    }

    function randBetween(min, max) {
        return min + (max - min) * Math.random();
    }

    function removeIntersections() {
        d3.selectAll(".intersection").remove();
    }

    function startSimulation() {
        if (simulation) {
            setTimeout(() => {
                simulation.nodes(nodes).alpha(1);
            }, 500);
        }
    }

    function timer() {
        let changeCount = 0;
        for (let i = 0; i < nodes.length; i++) {
            if (Math.random() < MUTATE_PROBABILITY) {
                let point = nodes[i];
                let oldFocus = point.focus;
                let newFocus = -1;
                while (newFocus < 0 || newFocus === oldFocus) {
                    newFocus = pickRandom(foci).index;
                }
                point.focus = newFocus;
                changeCount++;
            }
        }
        if (changeCount > 0) {
            updateCircleColor();
            startSimulation(nodes);
        }
    }

    function updateCircleColor() {
        svg.selectAll("circle")
            .attr("fill", d => foci[d.focus].color);
    }

    function updateCircles(dat) {
        let circles = svg.selectAll("circle").data(dat);

        // For existing circles, remove the "enter" class and
        // add the "update" class.
        circles.classed("enter", false)
            .classed("update", true);

        // Add new circles to the graph.
        circles.enter()
            .append("circle")
            .classed("node", true)
            .classed("enter", true)
            .attr("id", d => d.id)
            .attr("r", d => d.radius)
            .attr("fill", d => foci[d.focus].color)
            .attr("cx", d => d.x)
            .attr("cy", d => d.y)
            .merge(circles)
            .attr("fill", d => foci[d.focus].color)
            .attr("cx", d => d.x)
            .attr("cy", d => d.y)

        circles.exit().remove();
    }

    function updatePointFoci() {
        if (nodes && nodes.length) {
            for (let i = 0; i < nodes.length; i++) {
                let point = nodes[i];
                let focus = pickRandom(foci);
                point.focus = focus.index;
            }
        }
    }

    svg = d3.select("#canvas")
        .attr("width", WIDTH + 2 * MARGIN)
        .attr("height", HEIGHT + 2 * MARGIN)
        .style("border", "1px solid #c0c0c0")
        .append("g")
        .attr("class", "margin")
        .attr("transform", `translate(${MARGIN}, ${MARGIN})`);

    onFociCountChange();
    onNodeCountChange();
    updateCircles(nodes);

    simulation = d3.forceSimulation(nodes)
        .force("charge", d3.forceManyBody().strength(-10).distanceMin(CIRCLE_RADIUS))
        .force("collide", d3.forceCollide(CIRCLE_RADIUS))
        .force("position-x", d3.forceX(d => foci[d.focus].x).strength(0.1))
        .force("position-y", d3.forceY(d => foci[d.focus].y).strength(0.1))
        .on("tick", onSimulationTick);

    onChargeStrengthChange();
    onFociStrengthChange();

    setInterval(timer, INTERVAL_DURATION);

    $("#charge_strength").on("change", onChargeStrengthChange);
    $("#foci_count").on("change", onFociCountChange);
    $("#foci_strength").on("change", onFociStrengthChange);
    $("#node_count").on("change", onNodeCountChange);

})();
