if (typeof SVG !== "function") {
    throw Error("SVG is not defined!");
}

const size = [480, 480];
const postContent = document.querySelector(".post-content");
if (postContent && postContent.getBoundingClientRect) {
    const clientRect = postContent.getBoundingClientRect();
    size[0] = clientRect.width;
}
size[1] = 0.75 * size[0];

const center = [0.5 * size[0], 0.3 * size[1]];
const radius = 0.4 * Math.min(size[0], size[1]);
const radii = [1, 0.8, 0.6, 0.4];

const stroke = {
    color: "#638ad8",
    linecap: "round",
    linejoin: "round",
    opacity: 1,
    width: 20,
};

const initialDelay = 3000;
const duration = 5000;

function arc(radius, toPoint) {
    return `A ${radius} ${radius} 0 0 0 ${toPoint[0]} ${toPoint[1]}`;
}

function createPath(container, center, radius) {
    const path = container.path(`M ${pointOnCircle(center, radius, 90)} ${arc(radius, pointOnCircle(center, radius, 90))}`).stroke(stroke).fill("none");
    return path;
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
// const timeline = new SVG.Timeline();

for (let i = 0; i < radii.length; i++) {
    const _radius = radii[i] * radius;
    const path = createPath(elements, center, _radius);
    path.delay(initialDelay).animate(duration).ease("-").during((i) => {
        const from = 90 * (1 + i);
        const to = 90 * (1 - i);
        path.plot(`M ${pointOnCircle(center, _radius, from)} ${arc(_radius, pointOnCircle(center, _radius, to))}`)
    });
}

const stemStart = [
    center[0],
    center[1] + radii[3] * radius
];
const stemEndTop = [
    center[0],
    center[1] - 0.2 * radius
];
const stemEndBottom = [
    center[0],
    center[1] + 1.2 * radius
];
const stem = elements.line([stemStart, stemStart]).stroke(stroke).fill("none");
stem.delay(initialDelay).animate(duration).ease("-").during((i) => {
    const dyTop = stemStart[1] + i * (stemEndTop[1] - stemStart[1]);
    const dyBottom = stemStart[1] + i * (stemEndBottom[1] - stemStart[1]);
    stem.plot([[center[0], dyBottom], [center[0], dyTop]]);
});
