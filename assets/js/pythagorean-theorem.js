console.log("Starting.");
    
let squareSide = 300;
let margin = 10;
let svgWidth = squareSide*2 + margin*3;
let svgHeight = squareSide + margin*2;
let initialPosition = 100;

let leftPointPositions = [
    [  0, initialPosition],
    [squareSide - initialPosition,   0],
    [squareSide, squareSide - initialPosition],
    [initialPosition, squareSide]
];

let pointRadius = 6;
let pointColor = "#009";
    
let svg = d3.select("#canvas");
svg.attr("width", svgWidth)
    .attr("height", svgHeight)
    .style("background-color", "#eee")
    .style("border", "1px solid #333");
    
let leftBox = svg.append("g")
    .attr("transform", `translate(${margin},${margin})`);

let leftSquare = leftBox.append("rect")
    .attr("fill", "#fff")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", squareSide)
    .attr("height", squareSide);
    
let rightBox = svg.append("g")
    .attr("transform", `translate(${squareSide + margin*2},${margin})`);
    
let rightSquare = rightBox.append("rect")
    .attr("fill", "#fff")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", squareSide)
    .attr("height", squareSide);


let cpath = leftBox.append("path")
    .datum(leftPointPositions)
    .attr("fill", "#42a1f4")
    .attr("d", d3.line());


// Define the alpha point. This is the point that the user is allowed to 
// interact with. The alpha point can slide up and down the side of the box.
let alphaPoint = leftBox.append("circle")
    .classed("alpha", true)
    .attr("fill", "#037015")
    .attr("cx", leftPointPositions[0][0])
    .attr("cy", leftPointPositions[0][1])
    .attr("r", pointRadius);
    
    
let alphaDrag = d3.drag()
    .on("start", () => {
        alphaPoint.classed("dragging", true);
        console.log("Drag start.");
    })
    .on("drag", () => {
        // Only the y position should update. The x position is ignored.
        let y = bound(+d3.event.y, pointRadius, squareSide - pointRadius);
        alphaPoint.attr("cy", y);
        updateLeftBox(y);        
    })
    .on("end", () => {
        if (!d3.event.active) {
            console.log("Drag end.");
            alphaPoint.classed("dragging", false);
        }
    });

// Apply the alphaDrag event to the alphaPoint.
alphaPoint.call(alphaDrag);
    



    

function bound(value, min, max) {
    if (value < min) {
        return Math.floor(min);
    }
    if (value > max) {
        return Math.floor(max);
    }
    return Math.floor(value);
}
    
    
function getText() {
    let ab = Math.abs(+a.attr("cy") - +b.attr("cy"));
    let ac = Math.abs(+a.attr("cx") - +c.attr("cx"));
    let bc = Math.sqrt(Math.pow(+a.attr("cx"), 2));
        
    return `${ab} x ${ab} + ${ac} x ${ac} = ${bc} x ${bc}`;
}


function resetPositions() {
    aPos = { x: null, y: null };
    bPos = { x: null, y: null };
    cPos = { x: null, y: null };
}


// function updateBetaPoints() {
//     let yPos = +alphaPoint.attr("cy");
//     betaPointPosition[0][0] = squareSide - yPos;
//     betaPointPosition[1][1] = squareSide - yPos;
//     betaPointPosition[2][0] = yPos;
//     betaPoints.attr("cx", d => d[0])
//         .attr("cy", d => d[1]);
// }


function updateLeftBox(yPos) {
    leftPointPositions[0][1] = yPos;
    leftPointPositions[1][0] = squareSide - yPos;
    leftPointPositions[2][1] = squareSide - yPos;
    leftPointPositions[3][0] = yPos;
    cpath.attr("d", d3.line());
}


console.log("Done.");
