(() => {

    // Define constants.
    const CIRCLE_RADIUS = 12;
    const MARGIN = 20;
    const NUM_CIRCLES = 4;
    const NUM_PATHS = NUM_CIRCLES - 1;
    const PATH_WIDTH = 6;

    let colorIndex = 0;
    let colorCount = 2 * NUM_CIRCLES;

    // Grab SVG values.
    let svg = d3.select("#canvas-1");
    let width = +svg.attr("width");
    let height = +svg.attr("height");

    // Create holders for our circle definitions and our path definitions.
    let circleDefs = new Array(NUM_CIRCLES);
    let pathDefs = new Array(NUM_PATHS);
    let line = d3.line();

    function onDrag() {
        updateCircle(d3.event, this);
    }

    function onDragEnd() {
        updateCircle(d3.event, this);
    }

    function onDragStart() {
    }

    function updateCircle(event, target) {
        let node = d3.select(target);
        let data = node.datum();
        data.x = event.x;
        data.y = event.y;
        node.attr("cx", event.x).attr("cy", event.y);
        updatePaths();
    }

    function updatePaths() {
        for (let i = 0; i < NUM_PATHS; i++) {
            pathDefs[i].path = [];
            pathDefs[i].path[0] = [circleDefs[i].x, circleDefs[i].y];
            pathDefs[i].path[1] = [circleDefs[i + 1].x, circleDefs[i + 1].y];
        }
        paths.attr("d", d => line(d.path));
    }

    for (let i = 0; i < NUM_CIRCLES; i++) {
        circleDefs[i] = {
            i: i,
            x: Math.round(MARGIN + (i / (NUM_CIRCLES - 1)) * (width - 2 * MARGIN)),
            y: Math.round(MARGIN + Math.random() * (height - 2 * MARGIN)),
            color: d3.interpolateRainbow(colorIndex / colorCount)
        };
        colorIndex++;
    }

    for (let i = 0; i < pathDefs.length; i++) {
        pathDefs[i] = {
            i: i,
            color: d3.interpolateRainbow(colorIndex / colorCount),
            path: null
        };
        colorIndex++;
    }

    let paths = svg.selectAll("path")
        .data(pathDefs)
        .enter()
        .append("path")
        .attr("stroke", d => d.color)
        .attr("stroke-width", PATH_WIDTH);

    let circles = svg.selectAll("circle")
        .data(circleDefs)
        .enter()
        .append("circle")
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .attr("r", CIRCLE_RADIUS)
        .attr("fill", d => d.color);

    let dragBehavior = d3.drag()
        .on("start", onDragStart)
        .on("drag", onDrag)
        .on("end", onDragEnd);

    circles.call(dragBehavior);

    updatePaths();

})();
