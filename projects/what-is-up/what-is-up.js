const width = window.innerWidth;
const height = window.innerHeight;
const viewBox = [0, 0, width, height];

const backgroundColor = "#303030";
const skyColor = "#90ddf9";
const groundColor = "#309329";
const bodyColor = "#101010";
const bodyStrokeWidth = 4;

const transitionDelay = 0;
const transitionDuration = 2000;

const bodyHeadRadius = 0.01 * height;
const bodyPath = `M ${0.5 * width},${0.65 * height}`
    + `a ${bodyHeadRadius},${bodyHeadRadius},0,0,1,0,${2 * bodyHeadRadius}`
    + `a ${bodyHeadRadius},${bodyHeadRadius},0,0,1,0, ${-2 * bodyHeadRadius}`
    + `m 0,${2 * bodyHeadRadius}`
    + `v ${0.04 * height}`
    + `l ${0.01 * height},${0.04 * height}`
    + `m ${-0.01 * height},${-0.04 * height}`
    + `l ${-0.01 * height},${0.04 * height}`
    + `m ${-0.015 * height},${-0.05 * height}`
    + `l ${0.025 * height},${-0.02 * height}`
    + `l ${0.025 * height},${0.02 * height}`;

const svg = d3.select("#visual")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", viewBox);

const defs = svg.append("defs");
const textDropShadow = defs.append("filter")
    .attr("id", "text-drop-shadow")
    .attr("x", "-100%")
    .attr("y", "-100%")
    .attr("width", "300%")
    .attr("height", "300%");
textDropShadow.append("feGaussianBlur")
    .attr("in", "SourceAlpha")
    .attr("result", "blur")
    .attr("stdDeviation", 3);
textDropShadow.append("feComponentTransfer")
    .attr("in", "blur")
    .attr("result", "spread")
    .append("feFuncA")
    .attr("type", "linear")
    .attr("slope", 10)
textDropShadow.append("feColorMatrix")
    .attr("in", "spread")
    .attr("type", "matrix")
    .attr("values", "0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 1 0")
    .attr("result", "color");

const sky = svg.append("circle")
    .attr("fill", skyColor)
    .attr("stroke", "none")
    .attr("cx", width / 2)
    .attr("cy", 200.75 * height)
    .attr("r", 202 * height);

const earth = svg.append("circle")
    .attr("fill", groundColor)
    .attr("stroke", "none")
    .attr("cx", width / 2)
    .attr("cy", 200.75 * height)
    .attr("r", 200 * height);

const body = svg.append("path")
    .attr("fill", "none")
    .attr("stroke", bodyColor)
    .attr("stroke-linecap", "round")
    .attr("stroke-linejoin", "round")
    .attr("stroke-width", bodyStrokeWidth)
    .attr("d", bodyPath);

const whatIsUpText = [..."What Is Up?"].map((d, i) => {
    return {
        index: i,
        char: d,
        dx: 0,
        dy: 0,
    };
});

let currentLetterCount = 0;
let maxLetterCount = whatIsUpText.length;

const whatIsUp = svg.append("text")
    .attr("text-anchor", "middle")
    .attr("font-size", 0.2 * height)
    .attr("fill", "#ffffff")
    .attr("x", 0.5 * width)
    .attr("y", 0.3 * height)
    .attr("filter", "url(#text-drop-shadow)")
    .selectAll("tspan")
    .data(whatIsUpText)
    .join("tspan")
    .classed("floating-letters", true)
    .text(d => d.char)
    .attr("dx", d => d.dx)
    .attr("dy", d => d.dy)
    .attr("fill-opacity", 0)
    .transition()
    .duration(2000)
    .delay(0)
    .ease(d3.easeLinear)
    .attr("fill-opacity", 1)
    .on("end", () => {
        currentLetterCount++;
        if (currentLetterCount === maxLetterCount) {
            console.log("fade in completed");
            floatingLetters();
        }
    });

let currentStep = 0;

function rand(min, max) {
    return min + (max - min) * Math.random();
}

function letterDelta() {
    let delta = rand(-5, 5);
    if (-1 < delta && delta < 0) {
        delta = -1;
    } else if (0 < delta && delta < 1) {
        delta = 1;
    }
    return delta;
}

function floatingLetters() {
    currentLetterCount = 0;

    whatIsUpText.forEach(d => {
        d.dx += letterDelta();
        d.dy += letterDelta();
    });

    svg.selectAll("tspan.floating-letters")
        .transition()
        .duration(2000)
        .delay(0)
        .ease(d3.easeLinear)
        .attr("dx", d => d.dx)
        .attr("dy", d => d.dy)
        .on("end", () => {
            currentLetterCount++;
            if (currentLetterCount === maxLetterCount) {
                floatingLetters();
            }
        });
}

svg.on("click", () => {
    if (currentStep === 0) {
        console.log("transitioning to step 1")
        earth.transition()
            .duration(3000)
            .attr("cy", 0.9 * height)
            .attr("r", 0.2 * height);
        body.transition()
            .duration(3000)
            .attr("stroke-opacity", 0);
    }
    currentStep += 1;
});
