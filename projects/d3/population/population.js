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
    var xAxis = yAxis = null;
    var fetchOptions = {};

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

    var maleLine = d3.line()
        .x(d => xScale(d.age))
        .y(d => yScale(d.males));

    var femaleLine = d3.line()
        .x(d => xScale(d.age))
        .y(d => yScale(d.males + d.females));

    // Apply an offset grouping.
    var g = svg.append("g").attr("transform", "translate(" + padding.left + ", " + padding.top + ")");
    xAxis = d3.axisBottom(xScale);
    yAxis = d3.axisLeft(yScale).tickFormat(d3.format(".1s"));

    function draw(data) {
        femalePath = g.append("path")
            .attr("transform", "translate(1, 0)")
            .attr("fill", "salmon")
            .attr("stroke", "darkred")
            .attr("stroke-width", 2)
            .attr("d", femaleLine(data));
        malePath = g.append("path")
            .attr("transform", "translate(1, 0)")
            .attr("fill", "cornflowerblue")
            .attr("stroke", "darkblue")
            .attr("stroke-width", 2)
            .attr("d", maleLine(data));
        g.append("g")
            .attr("transform", "translate(0, " + height + ")")
            .call(xAxis);
        g.append("g")
            .attr("transform", "translate(0, 0)")
            .call(yAxis);
    }

    function fetchData(first) {
        var uri = baseUri + "population/" + year + "/" + country + "/";
        d3.json(uri, fetchOptions)
            .then(function (json) {
                var data = fixUpData(json);
                updateDomain(data);
                if (first) {
                    draw(data);
                } else {
                    transition(data);
                }
            })
            .catch(console.error);
    }

    /**
     *
     */
    function fixUpData(json) {
        var data = [ ];
        data.push({ age: d3.min(json, d => d.age), males: 0, females: 0, total: 0 });
        json.forEach(function (d) {
            data.push(d);
        });
        data.push({ age: d3.max(json, d => d.age), males: 0, females: 0, total: 0 });
        return data;
    }

    function transition(data) {
        femalePath.transition().attr("d", femaleLine(data));
        malePath.transition().attr("d", maleLine(data));
    }

    function updateDomain(data) {
        xScale.domain(d3.extent(data, d => d.age));
        yScale.domain([0, d3.max(data, d => d.total)]);
    }

    yearInput.on("change", function () {
        year = yearInput.node().value;
        fetchData(false);
    });

    // Set the year input to the current year and fetch data for the first time.
    yearInput.node().value = currentYear;
    fetchData(true);

})();
