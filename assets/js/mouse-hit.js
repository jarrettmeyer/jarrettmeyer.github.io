(() => {
    
    const width = 600;
    const height = 400;
    const highlightColor = "rgb(52, 104, 221)";
    const highlightOpacity = 1.00;
    const normalColor = "rgb(32, 32, 32)";
    const normalOpacity = 0.30;
    const textSize = 12;
    const textPadding = 6;
    const transitionDuration = 2000;
    
    let svg = d3.select("#canvas");
    let options = ["mousemove", "mouseenter", "mouseleave", "mouseout", "mouseover"];
    
    svg.attr("width", width)
        .attr("height", height)
        .style("background-color", "#eee")
        .style("border-color", "#222")
        .style("border-width", "1px")
        .style("border-style", "solid")
        .style("cursor", "crosshair")
        .on("mouseenter", mouseAction("mouseenter"))
        .on("mouseleave", mouseAction("mouseleave"))
        .on("mousemove", mouseAction("mousemove"))
        .on("mouseout", mouseAction("mouseout"))
        .on("mouseover", mouseAction("mouseover"));
    
    svg.append("rect")
        .attr("x", width * (1/3))
        .attr("y", height * (1/4))
        .attr("width", width * (1/3))
        .attr("height", height * (1/2))
        .attr("fill", "rgb(24, 107, 61)");    
        
    let statusBar = svg.append("g")
        .classed("status-bar", true)
        .attr("transform", `translate(0, ${height - 2*textPadding})`)
    
    statusBar.append("text")
        .classed("mouse-position", true)
        .attr("x", textPadding)
        .attr("y", textPadding)
        .attr("opacity", normalOpacity)
        .style("font-family", "sans-serif")
        .style("font-size", `${textSize}px`)
        .text(getMousePosition([0, 0]));
    
    let xoffset = 0;
    options.forEach(option => {
        xoffset += 100;
        statusBar.append("text")
            .classed(option, true)
            .attr("x", xoffset + textPadding)
            .attr("y", textPadding)
            .style("font-family", "sans-serif")
            .style("font-size", `${textSize}px`)
            .attr("fill", normalColor)
            .attr("opacity", normalOpacity)
            .text(option);
    });

    function bound(value, min, max) {
        if (value < min) {
            return min;
        }
        if (value > max) {
            return max;
        }
        return value;
    }

    function getMousePosition(mouse) {
        mouse[0] = bound(mouse[0], 0, width);
        mouse[1] = bound(mouse[1], 0, height);
        return `(${Math.floor(mouse[0])}, ${Math.floor(mouse[1])})`;
    }

    function highlight(target) {
        d3.select(`text.${target}`)
            .interrupt()
            .attr("fill", highlightColor)
            .attr("opacity", highlightOpacity)
            .transition()
            .duration(transitionDuration)
            .attr("fill", normalColor)
            .attr("opacity", normalOpacity);
    }

    function mouseAction(type) {
        return function () {
            updateMousePosition(d3.event.target);
            highlight(type);
        };
    }

    function updateMousePosition(target) {
        let mouse = d3.mouse(target);
        d3.select("text.mouse-position")
            .interrupt()
            .attr("fill", highlightColor)
            .attr("opacity", highlightOpacity)
            .text(getMousePosition(mouse))
            .transition()
            .duration(transitionDuration)
            .attr("fill", normalColor)
            .attr("opacity", normalOpacity);
    }
    
})();
