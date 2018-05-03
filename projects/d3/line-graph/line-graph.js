
var padding = { top: 10, bottom: 30, left: 70, right: 30 };
var year = new Date().getFullYear();
var country = "United States";
var url = "http://api.population.io/1.0/population/" + year + "/" + country + "/";

var svg = d3.select("#canvas");
var width = +svg.attr("width") - padding.left - padding.right;
var height = +svg.attr("height") - padding.top - padding.bottom;

// Draw the inner graphics element.
var g = svg.append("g").attr("transform", "translate(" + padding.left + ", " + padding.top + ")");

var xScale = d3.scaleLinear().range([0, width]);
var yScale = d3.scaleLinear().range([height, 0]);
var line = d3.line()
    .x(d => xScale(d.age))
    .y(d => yScale(d.population));

d3.json(url)
    .then(function (data) {
        data = data.map(d => { return { age: d.age, population: d.total }; });

        // Update the scales with the actual domain data.
        xScale.domain(d3.extent(data, d => d.age));
        yScale.domain([0, d3.max(data, d => d.population)]);

        // Draw the path.
        g.append("path")
             .datum(data)
             .attr("class", "line")
             .attr("fill", "none")
             .attr("stroke", "steelblue")
             .attr("stroke-width", "1.5px")
             .attr("d", line);

        // Draw the horizontal axis.
        g.append("g")
            .attr("transform", "translate(0, " + height + ")")
            .call(d3.axisBottom(xScale))
            .append("text")
            .attr("fill", "black")
            .attr("font-size", "10px")
            //.attr("y", 6)
            .attr("dx", width + 10)
            .attr("dy", 5)
            .attr("text-anchor", "start")
            .text("Age");

        // Draw the vertical axis.
        g.append("g")
            .call(d3.axisLeft(yScale))
            .append("text")
            .attr("fill", "black")
            .attr("transform", "rotate(-90)")
            .attr("dy", 6)
            .attr("dy", 12)
            .attr("text-anchor", "end")
            .text("Population");



    });
