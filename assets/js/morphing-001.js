const article = document.getElementsByTagName("article")[0];
const width = article.getBoundingClientRect().width;
const height = 400;
const n = 100;
const transitionDelay = 3000;
const transitionDuration = 1500;

function toCircle(cx, cy, r, n) {
    console.log(`Circle at (${cx}, ${cy}), r = ${r}`);
    let circle = [];
    let i0 = -3/8 * n;
    let i1 = 5/8 * n;
    for (let i = i0; i < i1; i++) {
        circle.push([
            cx + r * Math.cos(i/n * 2 * Math.PI),
            cy + r * Math.sin(i/n * 2 * Math.PI)
        ]);
    }
    return circle;
}

function toRectangle(left, top, width, height, n) {
    console.log(`Rectangle (${left}, ${top}), ${width} x ${height}.`);
    let rect = [];
    let n4 = n / 4;
    let dx = dy = 0;
    let x = left;
    let y = top;
    for (let s = 0; s < 4; s++) {
        if (s === 0) {
            dx = width / n4;
            dy = 0;
        }
        else if (s === 1) {
            dx = 0;
            dy = height / n4;
        }
        else if (s === 2) {
            dx = -width / n4;
            dy = 0;
        }
        else {
            dx = 0;
            dy = -1 * height / n4;
        }
        for (let i = 0; i < n4; i++) {
            rect.push([x, y]);
            x += dx;
            y += dy;
        }
    }
    return rect;
}

function toPath(coordinates) {
    return "M" + coordinates.map(c => `${c[0]},${c[1]}`).join("L") + "Z";
}

function randomCircle() {
    let r = 5 + 45 * Math.random();
    let cx = r + (width - 2*r) * Math.random();
    let cy = r + (height - 2*r) * Math.random();
    return toCircle(cx, cy, r, n);
}

function randomRectangle() {
    let w = 10 + 190 * Math.random();
    let h = 10 + 90 * Math.random();
    let left = (width - w) * Math.random();
    let top = (height - h) * Math.random();
    return toRectangle(left, top, w, h, n);
}

function randomColor() {
    return d3.interpolateRainbow(Math.random())
}

function loop(shape) {
    if (!shape) {
        // If the shape is undefined, then create a path
        // object on the SVG.
        shape = svg.append("path")
            .attr("d", toPath(randomRectangle()))
            .attr("fill", randomColor())
            .attr("stroke", "none");
    }
    shape.transition()
        .delay(transitionDelay)
        .duration(transitionDuration)
        .attr("d", toPath(randomCircle()))
        .attr("fill", randomColor())
        .transition()
        .delay(transitionDelay)
        .duration(transitionDuration)
        .attr("d", toPath(randomRectangle()))
        .attr("fill", randomColor())
        .on("end", () => {
            // When the last transition ends, kick off the loop
            // again.
            loop(shape);
        });
}

const svg = d3.select("#canvas-001")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", `0 0 ${width} ${height}`);

// Start the loop.
loop();
