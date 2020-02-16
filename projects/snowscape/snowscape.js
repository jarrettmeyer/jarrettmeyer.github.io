const body = document.body;
const width = body.clientWidth;
const height = body.clientHeight;

const maxSnowflakeCount = 120;
const minDuration = 4000;
const maxDuration = 12000;
const minRadius = 2;
const maxRadius = 5;

const moonGradientId = "moon-gradient";
const moonInnerRadius = Math.min(0.2 * width, 0.1 * height);
const moonOuterRadius = moonInnerRadius * 1.05;
const moonColor = "#fffce9";
const moonInitialPos = {
    x: rand(0.4, 0.8) * width,
    y: rand(0.05, 0.2) * height,
};

const snowBlurStdDeviation = 3;
const snowBlurId = "snow-blur";
const groundBlurStdDeviation = 2;
const groundBlurId = "ground-blur";

/**
 * Randomly generate a value between `min` and `max`.
 *
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
function rand(min, max) {
    const range = max - min;
    return min + range * Math.random();
}

const svg = d3.select("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height]);

const defs = svg.append("defs");

const skyLinearGradient = defs.append("linearGradient")
    .attr("id", "sky-gradient")
    .attr("gradientTransform", "rotate(90)");
skyLinearGradient.append("stop")
    .attr("offset", "0%")
    .attr("stop-color", "#07043f");
skyLinearGradient.append("stop")
    .attr("offset", "100%")
    .attr("stop-color", "#2f2b72");

const snowFilter = defs.append("filter")
    .attr("id", snowBlurId)
    .attr("x", "-100%")
    .attr("y", "-100%")
    .attr("width", "300%")
    .attr("height", "300%");
snowFilter.append("feGaussianBlur")
    .attr("stdDeviation", snowBlurStdDeviation);

const groundFilter = defs.append("filter")
    .attr("id", groundBlurId)
    .attr("x", "-100%")
    .attr("y", "-100%")
    .attr("width", "300%")
    .attr("height", "300%");
groundFilter.append("feGaussianBlur")
    .attr("stdDeviation", groundBlurStdDeviation);

svg.append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", width)
    .attr("height", height)
    .attr("fill", "url(#sky-gradient)");

const groundLineGenerator = d3.line()
    .x(d => d.x)
    .y(d => d.y)
    .curve(d3.curveBasisClosed);

const groundLine = groundLineGenerator([
    {
        x: -0.2 * width,
        y: 1.2 * height,
    },
    {
        x: -0.2 * width,
        y: 0.8 * height,
    },
    {
        x: rand(0.0, 0.2) * width,
        y: rand(0.7, 0.9) * height,
    },
    {
        x: rand(0.2, 0.4) * width,
        y: rand(0.7, 0.9) * height,
    },
    {
        x: rand(0.4, 0.6) * width,
        y: rand(0.7, 0.9) * height,
    },
    {
        x: rand(0.6, 0.8) * width,
        y: rand(0.7, 0.9) * height,
    },
    {
        x: rand(0.8, 1.0) * width,
        y: rand(0.7, 0.9) * height,
    },
    {
        x: 1.2 * width,
        y: 0.8 * height,
    },
    {
        x: 1.2 * width,
        y: 1.2 * height,
    }
]);

const ground = svg.append("path")
    .classed("ground", true)
    .attr("d", groundLine)
    .attr("stroke", "none")
    .attr("fill", "#ffffff")
    .attr("filter", `url(#${groundBlurId})`);

const moonPath = `M 0 0
    A ${moonOuterRadius} ${moonOuterRadius} 0 1 1 0 ${2 * moonInnerRadius}
    A ${moonInnerRadius} ${moonInnerRadius} 0 0 0 0 0
    Z`;

const moon = svg.append("g")
    .attr("transform", `translate(${moonInitialPos.x}, ${moonInitialPos.y}) rotate(${rand(10, 50)})`)
    .append("path")
    .classed("moon", true)
    .attr("d", moonPath)
    .attr("stroke", "none")
    .attr("fill", moonColor)
    .attr("filter", `url(#${snowBlurId})`);

const snowflakes = new Array(maxSnowflakeCount)
    .fill(0)
    .map((_, i) => { return { index: i }; });

function loop() {
    d3.active(this)
        .attr("cy", height)
        .transition()
        .duration(1)
        .attr("cx", () => rand(0, width))
        .attr("cy", -10)
        .attr("r", () => rand(minRadius, maxRadius))
        .transition()
        .duration(() => rand(minDuration, maxDuration))
        .ease(d3.easeLinear)
        .on("start", loop);
}


const snow = svg.selectAll("circle.snowflake")
    .data(snowflakes)
    .join("circle")
    .classed("snowflake", true)
    .attr("cx", () => rand(0, width))
    .attr("cy", () => rand(-height, 0))
    .attr("r", () => rand(minRadius, maxRadius))
    .attr("stroke", "none")
    .attr("fill", "#ffffff")
    .attr("filter", `url(#${snowBlurId})`)
    .transition()
    .duration(() => rand(2 * minDuration, 2 * maxDuration))
    .ease(d3.easeLinear)
    .on("start", loop);
