import { SVG } from "https://unpkg.com/@svgdotjs/svg.js@3.0.16/src/main.js";

const size = [480, 480];
const postContent = document.querySelector(".post-content");
if (postContent && postContent.getBoundingClientRect) {
    const clientRect = postContent.getBoundingClientRect();
    size[0] = clientRect.width;
}
size[1] = 0.75 * size[0];
console.log(`size: ${size}`);

const center = [size[0] / 2, size[1] / 2];
console.log(`center: ${center}`);
const radius = Math.min(center[0], center[1]) * 0.75;

const radii = [1, 0.8, 0.6, 0.4];

const stroke = {
    color: "#638ad8",
    linecap: "round",
    linejoin: "round",
    opacity: 1,
    width: 10,
};

function arc(radius, toPoint) {
    return `A ${radius} ${radius} 0 0 0 ${toPoint[0]} ${toPoint[1]}`;
}

function deg2rad(degrees) {
    return degrees * Math.PI / 180;
}

function pointOnCircle(center, radius, degrees) {
    return [
        center[0] + radius * Math.cos(deg2rad(degrees)),
        center[1] + radius * Math.sin(deg2rad(degrees)),
    ];
}

const draw = SVG("#view").size(size[0], size[1]);
const elements = draw.group();

for (let i = 0; i < radii.length; i++) {
    const _radius = radii[i] * radius;
    const path = elements.path(`M ${pointOnCircle(center, _radius, 90)} ${arc(radius, pointOnCircle(center, _radius, 90))}`).stroke(stroke).fill("none");
    path.animate(3000, "-").during((i) => {
        const from = 90 * (1 + i);
        const to = 90 * (1 - i);
        path.plot(`M ${pointOnCircle(center, _radius, from)} ${arc(_radius, pointOnCircle(center, _radius, to))}`)
    }).loop(true, true);
}
