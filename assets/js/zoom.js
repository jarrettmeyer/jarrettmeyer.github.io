$(document).ready(() => {
    console.log("Starting document ready callback.")

    let svg = d3.select("#canvas");
    let width = +svg.attr("width");
    let height = +svg.attr("height");
    let view = svg.select(".view");


    let minZoom = 1 / 20;
    let maxZoom = 20;
    let tickPadding = 4;
    
    let xScale = d3.scaleLinear()
        .domain([0, width])
        .range([0, width]);

    let yScale = d3.scaleLinear()
        .domain([0, height])
        .range([0, height]);

    let xAxis = d3.axisBottom(xScale)
        .ticks(7)
        .tickSize(height)
        .tickPadding(tickPadding - height);

    let yAxis = d3.axisRight(yScale)
        .ticks(5)
        .tickSize(width)
        .tickPadding(tickPadding - width);
    
    let xGroup = svg.append("g")
        .classed("axis", true)
        .classed("axis-x", true)
        .call(xAxis);
    
    let yGroup = svg.append("g")
        .classed("axis", true)
        .classed("axis-y", true)
        .call(yAxis);

    let zoom = d3.zoom()
        .scaleExtent([minZoom, maxZoom])
        .translateExtent([[0, 0], [width, height]])
        .on("zoom", () => {
            view.attr("transform", d3.event.transform);
            xGroup.call(xAxis.scale(d3.event.transform.rescaleX(xScale)));
            yGroup.call(yAxis.scale(d3.event.transform.rescaleY(yScale)));
            applyStyling();
        });    

    svg.call(zoom);
    d3.select("#reset-button")
        .on("click", () => {
            svg.transition()
                .duration(1000)
                .call(zoom.transform, d3.zoomIdentity);
        });
    applyStyling();
    
    //-------------------------------------------------------------------------
    // Everything after this point is styling.
    //-------------------------------------------------------------------------
    function applyStyling() {
        svg.selectAll(".domain").remove();
        svg.selectAll(".tick line")
            .attr("stroke", "#666")
            .attr("stroke-dasharray", "1,1");
        svg.selectAll(".tick text")
            .attr("fill", "#333");
    }
    
    console.log("Done.");
});