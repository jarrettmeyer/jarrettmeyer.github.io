(function () {

    var baseUri = "http://api.population.io/1.0/";
    var minYear = 1950;
    var currentYear = (new Date()).getFullYear();
    var year = currentYear;
    var country = "United States";
    var padding = {
        top: 20,
        bottom: 20,
        left: 20,
        right: 20
    };

    var yearInput = d3.select("select[name=year]");

    // Fill in the available years.
    for (var i = minYear; i <= currentYear; i++) {
        yearInput.append("option").text(i);
    }

    var svg = d3.select("#canvas");
    var width = +svg.attr("width");
    var height = +svg.attr("height");



    var xScale = d3.scaleLinear().range([0, width]);
    var yScale = d3.scaleLinear().range([height, 0]);

    var maleLine = d3.line()
        .x(d => xScale(d.age))
        .y(d => yScale(d.males));

    var femaleLine = d3.line()
        .x(d => xScale(d.age))
        .y(d => yScale(d.males + d.females));

    var malePath = null;
    var femalePath = null;

    function draw(data) {
        femalePath = svg.append("path")
            .attr("fill", "red")
            .attr("d", femaleLine(data));
        malePath = svg.append("path")
            .attr("fill", "blue")
            .attr("d", maleLine(data));
    }

    function fetchData(first) {
        var uri = baseUri + "population/" + year + "/" + country + "/";
        var fetchOptions = {};
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

    fetchData(true);

})();
