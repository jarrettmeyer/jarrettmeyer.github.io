(() => {

    let svg = d3.select("#canvas")
        .attr("xmlns", "http://www.w3.org/2000/svg")
        .attr("xmlns:xlink", "http://www.w3.org/1999/xlink")
        .attr("width", 600)
        .attr("height", 400);

    svg.append("rect")
        .attr("x", 2)
        .attr("y", 2)
        .attr("width", 596)
        .attr("height", 396)
        .attr("stroke", "black")
        .attr("stroke-width", 4)
        .attr("fill", "none");

    svg.append("rect")
        .attr("x", 10)
        .attr("y", 20)
        .attr("width", 300)
        .attr("height", 250)
        .attr("fill", "darkred");

    svg.append("circle")
        .attr("cx", 350)
        .attr("cy", 250)
        .attr("r", 120)
        .attr("fill", "darkblue");

    svg.append("text")
        .attr("x", 350)
        .attr("y", 100)
        .attr("fill", "green")
        .attr("font-size", 24)
        .attr("font-family", '"Lucida Sans Unicode", "Lucida Grande", Helvetica, Arial, sans-serif')
        .attr("font-style", "italic")
        .text("Hello, World!");

    d3.select("#download").on("click", () => {
        let serializer = new XMLSerializer();
        let source = '<?xml version="1.0"?>' + serializer.serializeToString(svg.node());
        let a = document.createElement("a");
        a.download = "image.svg";
        a.href = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(source);
        a.click();
    });

})();
