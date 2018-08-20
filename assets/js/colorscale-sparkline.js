function randBetween(min, max) {
    let range = max - min;
    return min + range * Math.random();
}


function sparkline(container, data, options) {

    const defaults = {
        domain: {
            y: [0, 100]
        },
        gradient: null,
        scale: {
            x: d3.scaleLinear(),
            y: d3.scaleLinear()
        },
        size: [100, 40],
        style: {
            stroke: "rgb(60, 120, 240)",
            strokeWidth: 1
        },
        value: {
            x: d => d[0],
            y: d => d[1]
        }
    };
    let gradientId = null;

    options = $.extend(true, defaults, options);

    let svg = d3.select(container)
        .append("svg")
        .classed("sparkline", true)
        .classed("sparkline-svg", true)        
        .attr("width", options.size[0])
        .attr("height", options.size[1]);

    if (options.gradient) {
        gradientId = "linear-gradient-" + Math.floor(Math.random() * 1e9);
        let gradient = svg.append("defs")
            .append("linearGradient")
            .attr("id", gradientId)
            .attr("x1", "0%")
            .attr("x2", "0%")
            .attr("y1", "100%")
            .attr("y2", "0%");
        let stops = [0, 0.25, 0.5, 0.75, 1.0];
        gradient.selectAll("stop")
            .data(stops)
            .enter()
            .append("stop")
            .attr("offset", d => Math.floor(d * 100) + "%")
            .attr("stop-color", d => options.gradient(d));
    }

    let g = svg.append("g")
        .classed("sparkline", true)
        .classed("sparkline-group", true);

    let xScale = options.scale.x
        .range([0, options.size[0]])
        .domain(d3.extent(data, options.value.x));

    let yScale = options.scale.y
        .range([options.size[1], 0])
        .domain(options.domain.y);
    
    let line = d3.line()
        .x(d => xScale(options.value.x(d)))
        .y(d => yScale(options.value.y(d)));


    let path = g.append("path")
        .classed("sparkline", true)
        .classed("sparkline-path", true)
        .datum(data)
        .attr("d", line)
        .attr("fill", "none")
        .attr("stroke", () => { return options.gradient ? `url(#${gradientId})` : options.style.stroke })
        .attr("stroke-width", options.style.strokeWidth);
    
    return path;
}


const duration = 30;
const myData = [];
const now = Date.now();
const min = 0;
const max = 20;

let myContainer = document.getElementById("sparkline-container");

let myOptions = {
    domain: {
        y: [min, max]
    },
    gradient: d3.interpolateViridis,
    size: [300, 100],
    value: {
        x: d => d.date,
        y: d => d.value
    }
};

for (let i = duration; i > 0; i--) {
    myData.push({
        date: new Date(now - (i * 24 * 60 * 60 * 1000)),
        value: randBetween(min, max)
    });
}

sparkline(myContainer, myData, myOptions);

