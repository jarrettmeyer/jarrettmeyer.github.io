/* jshint esversion: 6 */

(function () {

    const minCount = 2;
    const maxCount = 10;
    const minRadius = 5;
    const maxRadius = 20;
    const width = 680;
    const height = 200;
    const interval = 2500;
    const fontSize = 12;

    function getNewData() {
        let d = [];
        let c = randBetween(minCount, maxCount);
        for (let i = 0; i < c; i++) {
            d.push({
                index: i,
                radius: Math.floor(randBetween(minRadius, maxRadius))
            });
        }
        return d;
    }

    function getText(d) {
        let t = "[";
        for (let i = 0; i < d.length; i++) {
            t += d[i].radius;
            if (i < d.length - 1) {
                t += ", ";
            }
        }
        t += "]";
        return t;
    }

    function randBetween(min, max) {
        return min + (max - min) * Math.random();
    }

    function update(data) {

        // Select all the circles on the canvas and bind them to the data set.
        let circles = canvas.selectAll("circle")
                            .data(data);

        // Add the "update" classed to any existing circles that were selected.
        circles.attr("class", "update");

        // The enter command will add new circles. The merge command will modify
        // any existing circles that need to be transitioned.
        circles.enter()
               .append("circle")
               .attr("class", "enter")
               .attr("cx", d => xPos(d.index, data.length))
               .attr("cy", height / 2.0)
               .attr("r", d => d.radius)
               .merge(circles)
               .transition()
               .attr("cx", d => xPos(d.index, data.length))
               .attr("r", d => d.radius);

        // Remove any circles that need to be removed.
        circles.exit().remove();

        text.text(getText(data));
    }

    function xPos(i, n) {
        let space = width / (n + 1);
        return (i + 1) * space;
    }

    const canvas = d3.select("#canvas")
                     .attr("width", width)
                     .attr("height", height)
                     .style("background-color", "#ddd")
                     .style("border", "1px solid #111");

    let text = canvas.append("text")
                     .classed("text", true)
                     .attr("x", 10)
                     .attr("y", 190)
                     .attr("font-size", fontSize)
                     .text("Here!");

    update(getNewData());

    setInterval(function () {
        update(getNewData());
    }, interval);

})();
