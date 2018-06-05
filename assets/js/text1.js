(function () {

    const authorColor = "rgb(37, 29, 106)";
    const authorHeight = 16;
    const height = 200;
    const lineHeight = 1.6;
    const margin = { top: 20, left: 20 };
    const width = 600;
    const textColor = "rgb(28, 116, 203)";
    const textHeight = 14;
    const titleColor = "rgb(100, 94, 182)";
    const titleHeight = 20;

    const data = [
        { 
            title: "Sunset Park", 
            author: "Patrick Phillips",
            text: "The Chinese truck driver\nthrows the rope\nlike a lasso, with a practiced flick"
        }
    ];
    
    const canvas = d3.select("#canvas")
        .attr("width", width)
        .attr("height", height)
        .style("background-color", "#e0e0e0")
        .style("border", "1px solid #101010");
        
    let text = canvas.selectAll("text")
        .data(data)
        .enter()
        .append("text")
        .attr("x", margin.left)
        .attr("y", margin.top)
        .attr("fill", "black");
    
    text.append("tspan")
        .text(d => d.title)
        .attr("class", "title")
        .attr("font-size", titleHeight)
        .attr("fill", titleColor);
    
    text.append("tspan")
        .text(d => `-- ${d.author}`)
        .attr("class", "author")
        .attr("font-size", authorHeight)
        .attr("fill", authorColor)
        .attr("x", margin.left)
        .attr("dx", 20)
        .attr("dy", Math.floor(authorHeight * lineHeight));
    
    text.selectAll("tspan.text")
        .data(d => d.text.split("\n"))
        .enter()
        .append("tspan")
        .attr("class", "text")
        .text(d => d)
        .attr("font-size", textHeight)
        .attr("fill", textColor)
        .attr("x", margin.left)
        .attr("dx", 10)
        .attr("dy", Math.floor(textHeight * lineHeight));
    
})();
