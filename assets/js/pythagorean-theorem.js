console.log("Starting.");

let squareSide = 300;
let margin = 10;
let svgWidth = squareSide*2 + margin*3;
let svgHeight = squareSide + margin*2;
let initialPosition = 100;
let pointRadius = 6;
let pointColor = "rgb(50, 200, 50)";
let lineGenerator = d3.line();
let svg = d3.select("#canvas");
let triangleColors = [
    "rgb(220, 4, 25)",
    "rgb(180, 4, 25)",
    "rgb(140, 4, 25)",
    "rgb(100, 4, 25)"
];
let squareColors = [
    "rgb(50, 100, 200)",
    "rgb(50, 100, 150)",
    "rgb(50, 100, 100)"
];
let textSize = 12;
let textColor = "#000";
let textPadding = 2;
let textOffsetX = -4;

// Set the width and height of the SVG canvas.
svg.attr("width", svgWidth)
    .attr("height", svgHeight)
    .style("background-color", "#eee")
    .style("border", "1px solid #333");

// Create groups for the left and right sides.
let leftGroup = svg.append("g")
    .attr("transform", `translate(${margin},${margin})`);
let rightGroup = svg.append("g")
    .attr("transform", `translate(${squareSide + margin*2},${margin})`);

// Create backgrounds for the left and right sides.
let leftBackground = leftGroup.append("rect")
    .classed("background", true)
    .attr("fill", "#fff")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", squareSide)
    .attr("height", squareSide);
let rightBackground = rightGroup.append("rect")
    .classed("background", true)
    .attr("fill", "#fff")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", squareSide)
    .attr("height", squareSide);

let squareData = getSquareData(squareSide, initialPosition);
let triangleData = getTriangleData(squareSide, initialPosition);

// Draw the 3 primary squares.
leftGroup.append("path")
    .classed("square", true)
    .classed("square-0", true)
    .datum(squareData[0])
    .attr("fill", squareColors[0])
    .attr("d", lineGenerator);
leftGroup.append("path")
    .classed("square", true)
    .classed("square-1", true)
    .datum(squareData[1])
    .attr("fill", squareColors[1])
    .attr("d", lineGenerator);
rightGroup.append("path")
    .classed("square", true)
    .classed("square-2", true)
    .datum(squareData[2])
    .attr("fill", squareColors[2])
    .attr("d", lineGenerator);

// Draw the 4 triangles on the left side of the graphic.
for (let i = 0; i < 4; i++) {
    leftGroup.append("path")
        .classed("triangle", true)
        .classed(`triangle-0-${i}`, true)
        .datum(triangleData[0][i])
        .attr("fill", triangleColors[i])
        .attr("d", lineGenerator);
}

// Draw the 4 triangles on the right side of the graphic.
for (let i = 0; i < 4; i++) {
    rightGroup.append("path")
        .classed("triangle", true)
        .classed(`triangle-1-${i}`, true)
        .datum(triangleData[1][i])
        .attr("fill", triangleColors[i])
        .attr("d", lineGenerator);
}


// Define the alpha point. This is the point that the user is allowed to
// interact with. The alpha point can slide up and down the side of the box.
let alphaPoint = leftGroup.append("circle")
    .classed("alpha", true)
    .attr("fill", pointColor)
    .attr("cx", 0)
    .attr("cy", initialPosition)
    .attr("r", pointRadius);


let alphaDrag = d3.drag()
    .on("start", () => {
        alphaPoint.classed("dragging", true);
    })
    .on("drag", () => {
        // Only the y position should update. The x position is ignored.
        let y = bound(+d3.event.y, 2*pointRadius, squareSide - 2*pointRadius);
        alphaPoint.attr("cy", y);
        let squareData = getSquareData(squareSide, y);
        let triangleData = getTriangleData(squareSide, y);
        updateSquarePositions(squareData);
        updateTrianglePositions(triangleData);
        updateText(squareData);
    })
    .on("end", () => {
        if (!d3.event.active) {
            alphaPoint.classed("dragging", false);
        }
    });

// Apply the alphaDrag event to the alphaPoint.
alphaPoint.call(alphaDrag);


// Add the text for the "a" and "b" values.
let textA = leftGroup.append("text")
    .classed("text-a", true)
    .attr("fill", textColor)
    .attr("font-size", textSize)
    .text("a")
    .attr("x", squareData[0][2][0]/2 + textOffsetX)
    .attr("y", squareData[0][2][1] - textPadding);

let textB = leftGroup.append("text")
    .classed("text-b", true)
    .attr("fill", textColor)
    .attr("font-size", textSize)
    .text("b")
    .attr("x", squareData[1][0][0] + (squareData[1][2][0] - squareData[1][0][0])/2 + textOffsetX)
    .attr("y", squareData[0][2][1] + textPadding + textSize);

let textC = rightGroup.append("text")
    .classed("text-c", true)
    .attr("fill", textColor)
    .attr("font-size", textSize)
    .text("c")
    .attr("x", (squareData[1][2][0] - squareData[1][0][0])/2 + textSize/2 + textOffsetX)
    .attr("y", squareData[0][2][0]/2 + textSize/2);


function bound(value, min, max) {
    if (value < min) {
        return Math.floor(min);
    }
    if (value > max) {
        return Math.floor(max);
    }
    return Math.floor(value);
}


function getSquareData(l, y) {
    let a = y;
    let b = l - y;
    return [
        [
            [0, 0],
            [a, 0],
            [a, a],
            [0, a]
        ],
        [
            [a, a],
            [a+b, a],
            [a+b, a+b],
            [a, a+b]
        ],
        [
            [0, a],
            [b, 0],
            [l, b],
            [a, l]
        ]
    ];
}


function getTriangleData(l, y) {
    let a = y;
    let b = l - y;
    return [
        [
            [[0, a], [a, a], [0, l]],
            [[a, a], [0, l], [a, l]],
            [[a, 0], [a, a], [l, 0]],
            [[a, a], [l, 0], [l, a]]
        ],
        [
            [[0, a], [0, 0], [b, 0]],
            [[b, 0], [l, 0], [l, b]],
            [[l, b], [l, l], [a, l]],
            [[a, l], [0, l], [0, a]]
        ]
    ];
}


function updateSquarePositions(squareData) {
    for (let i = 0; i < 3; i++) {
        d3.select(`path.square-${i}`).datum(squareData[i]).attr("d", lineGenerator);
    }
}


function updateText(squareData) {
    textA.attr("x", squareData[0][2][0]/2 + textOffsetX)
        .attr("y", squareData[0][2][1] - textPadding);
    textB.attr("x", squareData[1][0][0] + (squareData[1][2][0] - squareData[1][0][0])/2 + textOffsetX)
        .attr("y", squareData[0][2][1] + textPadding + textSize);
    textC.attr("x", (squareData[1][2][0] - squareData[1][0][0])/2 + textSize/2 + textOffsetX)
        .attr("y", squareData[0][2][0]/2 + textSize/2);
}


function updateTrianglePositions(triangleData) {
    for (let i = 0; i < 2; i++) {
        for (let j = 0; j < 4; j++) {
            d3.select(`path.triangle-${i}-${j}`).datum(triangleData[i][j]).attr("d", lineGenerator);
        }
    }
}


console.log("Done.");
