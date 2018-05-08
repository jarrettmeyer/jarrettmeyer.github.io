(function () {

    // Variable declarations.
    var svg = d3.select("#canvas");
    var data = {
        nodes: [],
        links: []
    };
    var initialRadius = 10;
    var fadeTime = 5000;
    var id = 0;

    // Add a group of nodes.
    var nodes = svg.append("g")
        .attr("class", "nodes");

    svg.on("click", function () {
        var _id = ++id;
        var mouse = d3.mouse(this);
        // console.log("mouse", mouse);
        var circle = drawCircle(mouse[0], mouse[1], _id);
        fadeCircle(circle);
    });

    function drawCircle(x, y, id) {
        data.nodes.push({ id: id, x: x, y: y });
        var circle = nodes.append("circle")
            .attr("cx", x)
            .attr("cy", y)
            .attr("r", initialRadius)
            .attr("opacity", 1.0)
            .attr("id", id);
        return circle;
    }

    function fadeCircle(circle) {
      var t = d3.transition()
          .delay(1000)
          .duration(fadeTime)
          .ease(d3.easeLinear);
      circle.transition(t)
          .attr("opacity", 0.0)
          .on("end", onFadeCircleEnd);
    }

    function onFadeCircleEnd() {
        // console.log("Fade ended", this);
        var _this = d3.select(this);
        data.nodes = data.nodes.filter(d => d.id !== +_this.attr("id"));
        _this.remove();
        // console.log("data points remaining:", data.nodes.length);
    }

})();
