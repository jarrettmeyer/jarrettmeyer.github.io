(function () {

    // Variables.
    var baseUri = "http://api.population.io/1.0/";
    var minYear = 1950;
    var currentYear = (new Date()).getFullYear();
    var year = currentYear;
    var country = "United States";
    var padding = {
        top: 20,
        bottom: 30,
        left: 50,
        right: 20
    };
    var malePath = femalePath = null;
    var maleArea = femaleArea = null;
    var xAxis = yAxis = null;
    var fetchOptions = {};
    var maxPopulation = 5 * 1e6;
    var strokeWidth = 3.0;

    // Define the year input.
    var yearInput = d3.select("select[name=year]");

    // Fill in the available years.
    for (var i = minYear; i <= currentYear; i++) {
        yearInput.append("option").text(i);
    }

    // Select the D3 SVG element, and compute the width & height.
    var svg = d3.select("#canvas");
    var width = +svg.attr("width") - padding.left - padding.right;
    var height = +svg.attr("height") - padding.top - padding.bottom;

    // Define the X and Y scales. The coordinates begin with (0, 0) in the
    // top-left, so we define the height scale backwards.
    var xScale = d3.scaleLinear().range([0, width]);
    var yScale = d3.scaleLinear().range([height, 0]);

    // Define the male and female lines. Since we want to draw the female line on
    // top of the male line, we will add the values.
    var maleLine = d3.line()
        .x(d => xScale(d.age))
        .y(d => yScale(d.males));
    var femaleLine = d3.line()
        .x(d => xScale(d.age))
        .y(d => yScale(d.males + d.females));

    // Apply an offset grouping.
    var g = svg.append("g")
        .attr("transform", "translate(" + padding.left + ", " + padding.top + ")");

    function draw(data) {
        var areaData = fixUpData(data);

        // Draw the female and male areas.
        femaleArea = g.append("path")
            .attr("transform", "translate(1, -1)")
            .attr("fill", "salmon")
            .datum(areaData)
            .attr("d", femaleLine);
        maleArea = g.append("path")
            .attr("transform", "translate(1, -1)")
            .attr("fill", "lightblue")
            .datum(areaData)
            .attr("d", maleLine);

        // Draw the male and female lines.
        femalePath = g.append("path")
            .attr("transform", "translate(1, -1)")
            .attr("fill", "none")
            .attr("stroke", "darkred")
            .attr("stroke-width", strokeWidth)
            .datum(data)
            .attr("d", femaleLine);
        malePath = g.append("path")
            .attr("transform", "translate(1, -1)")
            .attr("fill", "none")
            .attr("stroke", "darkblue")
            .attr("stroke-width", strokeWidth)
            .datum(data)
            .attr("d", maleLine);
    }

    /**
     * Fetch data. If this is the first fetch, then draw the data set. If this is
     * not the first fetch, then transition the data.
     */
    function fetchData() {
        var uri = baseUri + "population/" + year + "/" + country + "/";
        d3.json(uri, fetchOptions)
            .then(function (json) {
                updateDomain(json);
                if (!malePath && !femalePath) {
                    draw(json);
                } else {
                    transition(json);
                }
            })
            .catch(console.error);
    }

    /**
     * Fix up the data. We need to add two data points, one at the beginning and
     * one at the end.
     */
    function fixUpData(json) {
        var data = json.map(j => j);
        data.push({ age: d3.max(json, d => d.age), males: 0, females: 0, total: 0 });
        data.push({ age: d3.min(json, d => d.age), males: 0, females: 0, total: 0 });
        return data;
    }

    function transition(data) {
        var areaData = fixUpData(data);
        femaleArea.transition().attr("d", femaleLine(areaData));
        maleArea.transition().attr("d", maleLine(areaData));
        femalePath.transition().attr("d", femaleLine(data));
        malePath.transition().attr("d", maleLine(data));
    }

    function updateDomain(data) {
        xScale.domain(d3.extent(data, d => d.age));
        // yScale.domain([0, d3.max(data, d => d.total)]);
        yScale.domain([0, maxPopulation]);
        g.selectAll("g")
            .remove();
        xAxis = d3.axisBottom(xScale);
        yAxis = d3.axisLeft(yScale).tickFormat(d3.format(".2s"));
        g.append("g")
            .attr("transform", "translate(0, " + height + ")")
            .call(xAxis);
        g.append("g")
            .attr("transform", "translate(0, 0)")
            .call(yAxis);
    }

    yearInput.on("change", function () {
        year = yearInput.node().value;
        fetchData();
    });

    // Set the year input to the current year and fetch data for the first time.
    yearInput.node().value = currentYear;
    fetchData();

})();
