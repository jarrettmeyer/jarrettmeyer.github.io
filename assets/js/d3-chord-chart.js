(() => {

    let fontSize = 10;
    let fontFamily = "Arial, sans-serif";
    let numCategories = 5;
    let arrow = "\u2192";
    let tickSize = 6;
    let smallTick = 100;
    let largeTick = 500;
    let format = d3.format(",");

    let svg = d3.select("#canvas");
    let table = d3.select("#table");

    let width = svg.node().parentElement.getBoundingClientRect().width;
    let height = Math.min(width, 640);
    let outerRadius = Math.min(width, height) * 0.5 - 40;
    let innerRadius = outerRadius - 20;

    // Initial settings for the SVG object.
    svg.attr("width", width)
        .attr("height", height)
        .attr("font-size", fontSize)
        .attr("font-family", fontFamily);

    /**
     * Function to generate colors for the chord chart.
     *
     * @param {*} x
     * @param {*} n
     */
    function color(x, n) {
        return d3.interpolateViridis(x / n);
    }

    function deg2rad(x) {
        return x * Math.PI / 180;
    }

    function label(i) {
        return `State ${i + 1}`;
    }

    function randInt(min, max) {
        let rng = max - min;
        let value = Math.random() * rng + min;
        return Math.floor(value);
    }

    function rad2deg(x) {
        return x * 180 / Math.PI;
    }

    /**
     * Function to generate the tick marks for a single arc.
     *
     * @param {object} data
     * @param {number} step
     */
    function ticks(data, step) {
        let k = (data.endAngle - data.startAngle) / data.value;
        return d3.range(0, data.value, step).map((x) => {
            return {
                value: x,
                angle: x * k + data.startAngle
            };
        });
    }

    // Create a numCategories x numCategories.
    let data = new Array(numCategories)
        .fill([])
        .map(() => new Array(numCategories)
            .fill(0)
            .map(() => randInt(10, 1000))
        );

    // Chord-ify the data set.
    let chord = d3.chord().padAngle(deg2rad(1));
    let chords = chord(data);

    // Generator function for the outer arcs.
    let arc = d3.arc()
        .innerRadius(innerRadius)
        .outerRadius(outerRadius);

    // Generator function for the inner chords.
    let ribbon = d3.ribbon().radius(innerRadius);

    // Add a static white background. Helps with exporting SVGs.
    svg.append("g")
        .classed("background", true)
        .append("rect")
        .attr("fill", "white")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", width)
        .attr("height", height);

    // Define the view window for the chort chart.
    let gView = svg.append("g")
        .classed("view", true)
        .attr("transform", `translate(${width / 2}, ${height / 2})`);

    // Create a wrapping group for the chord groups (arcs).
    let gGroups = gView.selectAll("g.group")
        .data(chords.groups)
        .join("g")
        .classed("group", true);

    // Create a wrapping group for the chord groups.
    let gChords = gView.selectAll("g.chord")
        .data(chords)
        .join("g")
        .classed("chord", true);

    // Create a path, using the arc generator function, for each
    // group in the data set.
    gGroups.append("path")
        .attr("fill", d => color(d.index, numCategories))
        .attr("stroke", d => d3.rgb(color(d.index, numCategories)).darker())
        .attr("stroke-width", 1)
        .attr("d", arc)
        .append("title")
        .text(d => label(d.index));

    // Create a group for each small tick mark.
    let gTicks = gGroups.selectAll("g.tick")
        .data(d => ticks(d, smallTick))
        .join("g")
        .classed("tick", true)
        .attr("transform", d => `rotate(${rad2deg(d.angle) - 90}) translate(${outerRadius}, 0)`);

    // Create a tick for each tick mark.
    gTicks.append("line")
        .attr("x1", 0)
        .attr("x2", tickSize)
        .attr("stroke", "black")
        .attr("stroke-width", 1);

    // Create a text element for large tick mark.
    gTicks.append("text")
        .filter(d => d.value % largeTick === 0)
        .attr("x", tickSize + 2)
        .attr("dy", "0.35em")
        .attr("transform", d => d.angle < Math.PI ? "rotate(0) translate(0)": "rotate(180) translate(-16, 0)")
        .attr("text-anchor", d=> d.angle < Math.PI ? "start" : "end")
        .text(d => format(d.value));

    // Create a path, using the ribbon generator function, for each
    // path in the data set.
    gChords.append("path")
        .attr("d", ribbon)
        .attr("fill", d => color(d.target.index, numCategories))
        .attr("opacity", 0.5)
        .attr("stroke", d => d3.rgb(color(d.target.index, numCategories)).darker())
        .append("title")
        .text(d => `${label(d.source.index)} ${arrow} ${label(d.target.index)}`);

    // Create our data set.
    table.selectAll("tr")
        .data(data)
        .join("tr")
        .selectAll("td")
        .data((_, i) => data[i])
        .join("td")
        .text(d => d);

    d3.select("#state-1-3").text(data[0][2]);
    d3.select("#state-2-2").text(data[1][1]);

})();
