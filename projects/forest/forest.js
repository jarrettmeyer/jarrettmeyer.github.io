const xmlns = "http://www.w3.org/2000/svg";
const width = window.innerWidth;
const height = window.innerHeight;

const forest = document.getElementById("forest");
const sky = document.getElementById("sky");
// const ground = document.getElementById("ground");
const trees = document.getElementById("trees");

const numTrees = 1000;
let lastCY = 0.6 * height;

// Update the forest (svg) element
forest.setAttribute("width", width);
forest.setAttribute("height", height);
forest.setAttribute("viewBox", `0 0 ${width} ${height}`);

// Update the sky (rect) element
sky.setAttribute("width", width);
sky.setAttribute("height", height);

function rand(min, max) {
    const range = max - min;
    const value = min + range * Math.random();
    return value;
}

function createRandomTree() {
    const r = Math.round(rand(37, 51));
    const g = Math.round(rand(68, 96));
    const b = Math.round(rand(4, 55));
    const fill = `rgb(${r},${g},${b})`;
    const ellipse = document.createElementNS(xmlns, "ellipse");
    let cy = lastCY + rand(0, 1);
    ellipse.setAttribute("fill", fill);
    ellipse.setAttribute("cx", rand(0, width));
    ellipse.setAttribute("cy", cy);
    ellipse.setAttribute("rx", rand(50, 100));
    ellipse.setAttribute("ry", rand(40, 80));

    trees.append(ellipse);

    lastCY = cy;
}

// const groundY = Math.floor(0.7 * height);
// ground.setAttribute("y", groundY);
// ground.setAttribute("height", height - groundY);
// ground.setAttribute("width", width);

for (let i = 0; i < numTrees; i++) {
    createRandomTree();
}
