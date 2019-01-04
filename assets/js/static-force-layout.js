(() => {

    const DEFAULT_RADIUS = 3;
    const MAX_NODE_SIZE = 20;
    const MIN_NODE_SIZE = 1;
    const NUMBER_OF_NODES = 25;
    const PROBABILITY_OF_LINK = 0.05;

    let canvas = d3.select("#canvas");
    let width = +canvas.attr("width");
    let height = +canvas.attr("height");

    let data = {
        nodes: [],
        links: []
    };


    /**
     * Draw the nodes and the links for the force-directed graph.
     */
    function draw() {
        // Draw links.
        canvas.selectAll("line")
            .data(data.links)
            .enter()
            .append("line")
            .attr("stroke", "#999")
            .attr("stroke-opacity", 0.6)
            .attr("stroke-width", d => d.weight)
            .attr("x1", d => d.source.x)
            .attr("x2", d => d.target.x)
            .attr("y1", d => d.source.y)
            .attr("y2", d => d.target.y);

        // Draw nodes.
        canvas.selectAll("circle")
            .data(data.nodes)
            .enter()
            .append("circle")
            .attr("fill", d => d.color)
            .attr("r", d => Math.sqrt(d.size) * DEFAULT_RADIUS)
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);
    }


    /**
     * Generate new data for the force-directed graph.
     */
    function generateNewData() {
        // Reset the data object back to its empty state.
        data.nodes = [];
        data.links = [];

        // Create nodes.
        for (let i = 0; i < NUMBER_OF_NODES; i++) {
            let node = {
                index: i,
                color: d3.interpolateRainbow(i / NUMBER_OF_NODES),
                size: Math.floor(randBetween(MIN_NODE_SIZE, MAX_NODE_SIZE))
            }
            data.nodes.push(node);
        }

        // Create links.
        for (let i = 0; i < NUMBER_OF_NODES; i++) {
            for (let j = i + 1; j < NUMBER_OF_NODES; j++) {
                if (Math.random() < PROBABILITY_OF_LINK) {
                    let minSize = Math.min(data.nodes[i].size, data.nodes[j].size);
                    let link = {
                        source: data.nodes[i],
                        target: data.nodes[j],
                        weight: Math.floor(randBetween(1, minSize))
                    }
                    data.links.push(link);
                }
            }
        }

        return data;
    }


    /**
     * Is the graph animated?
     *
     * Defines if the graph is animated based on which radio button is checked.
     */
    function isAnimated() {
        let val = +$("input[name=input-animate]:checked").val();
        return val === 1;
    }


    /**
     * Generate a random number between given min and max values.
     *
     * @param {number} min
     * @param {number} max
     */
    function randBetween(min, max) {
        return min + (max - min) * Math.random();
    }


    /**
     * Simulate forces.
     */
    function simulate() {
        // Remove all existing elements from the canvas.
        canvas.selectAll("*").remove();

        // Capture the start time.
        let startTime = +Date.now();

        // Create a new force simulation and assign forces.
        let simulation = d3.forceSimulation(data.nodes)
            .force("center", d3.forceCenter(width / 2, height / 2))
            .force("collide", d3.forceCollide(d => d.size))
            .force("link", d3.forceLink(data.links).strength(d => Math.sqrt(d.weight)))
            .force("manyBody", d3.forceManyBody());

        if (isAnimated()) {
            simulateAnimated(simulation, startTime);
        }
        else {
            simulateStatic(simulation, startTime);
        }
    }


    function simulateAnimated(simulation, startTime) {
        draw();
        simulation.on("tick", () => {
            // Update links.
            canvas.selectAll("line")
                .attr("x1", d => d.source.x)
                .attr("x2", d => d.target.x)
                .attr("y1", d => d.source.y)
                .attr("y2", d => d.target.y);

            // Update nodes.
            canvas.selectAll("circle")
                .attr("cx", d => d.x)
                .attr("cy", d => d.y);
        });

        // Update the timer.
        simulation.on("end", () => {
            updateDuration(startTime);
        });
    }


    function simulateStatic(simulation, startTime) {
        simulation.stop();

        while (simulation.alpha() > simulation.alphaMin()) {
            simulation.tick();
        }

        // The simulation has been completed. Draw the final product and update the timer.
        draw();
        updateDuration(startTime);
    }


    /**
     * Update the animation duration display.
     *
     * @param {number} startTime Start time, as an integer date.
     */
    function updateDuration(startTime) {
        let endTime = +Date.now();
        let duration = endTime - startTime;
        $("#animation-duration").text(duration + " ms");
    }

    $("input[name=input-animate][value=1]").prop("checked", true);
    $("input[name=input-animate]").on("click", () => {
        simulate();
    });
    $("#generate-new-data").on("click", () => {
        generateNewData();
        simulate();
    });

    // Create new data and start the force simulation.
    generateNewData();
    simulate();


})();
