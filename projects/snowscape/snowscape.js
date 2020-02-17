const width = window.innerWidth;
const height = window.innerHeight;

const snowscape = document.getElementById("snowscape");
const nightSky = document.getElementById("night-sky");
const ground = document.getElementById("ground");
const moon = document.getElementById("moon");
const gSnowflakes = document.getElementById("snowflakes");

/**
 * Randomly generate a value between `min` and `max`.
 *
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
function rand(min, max) {
    const range = max - min;
    const value = min + range * Math.random();
    return value;
}

// Update the dimensions of the snowscape
snowscape.setAttribute("width", width);
snowscape.setAttribute("height", height);
snowscape.setAttribute("viewBox", `0 0 ${width} ${height}`);

// Update the dimensions of the night sky
nightSky.setAttribute("width", width);
nightSky.setAttribute("height", height);

// Move the moon
const moonPositionX = Math.round(rand(0.3 * width, 0.7 * width));
const moonPositionY = Math.round(rand(0.1 * height, 0.1 * height));
const moonRotation = Math.round(rand(10, 60));
moon.setAttribute("transform", `translate(${moonPositionX}, ${moonPositionY}) rotate(${moonRotation})`);

// Create the path object for the ground
const numPoints = 8;
const deltaX = Math.ceil(width / numPoints);
let prevX = -deltaX;
let prevY = rand(0.8 * height, 0.9 * height);
let controlX = controlY = 0;
let groundPath = `M ${prevX} ${height}`;
groundPath += `L ${prevX} ${prevY}`;
for (let i = 0; i < numPoints + 1; i++) {
    nextX = i * deltaX;
    nextY = prevY - Math.round(rand(-0.02 * height, 0.02 * height));
    controlX = Math.round((prevX + nextX) / 2);
    controlY = Math.round((prevY + nextY) / 2);
    groundPath += `S ${controlX} ${controlY} ${nextX} ${nextY}`;
    prevX = nextX;
    prevY = nextY;
}
groundPath += `L ${width + deltaX} ${height}`;
groundPath += "Z";
ground.setAttribute("d", groundPath);

const numSnowflakes = 120;
const pCreateSnowflake = 0.05;
const snowflakes = new Array(numSnowflakes);

// Create an animation loop for snow falling.
function snowfall(snowflake) {
    // Get properties about the snowflake
    const index = +snowflake.dataset.index;
    const createdAt = +snowflake.dataset.createdAt;
    const duration = +snowflake.dataset.duration;
    const timer = +snowflake.dataset.timer;
    let cx = +snowflake.getAttribute("cx");
    let r = +snowflake.getAttribute("r");
    return (now) => {
        // Update the snowflake's properties
        const elapsed = now - createdAt;
        const cy = elapsed / duration * height;
        cx = cx + rand(-0.1, 0.1);
        r = r + rand(-0.1, 0.1);
        if (r < 0.1) {
            r = 0.1;
        }
        snowflake.setAttribute("cy", cy);
        snowflake.setAttribute("cx", cx);
        snowflake.setAttribute("r", r);
        if (elapsed < duration) {
            // Still ticking...
            window.requestAnimationFrame(snowfall(snowflake));
        } else {
            // Destroy the snowflake and cancel the animation frame
            snowflakes[index] = undefined;
            snowflake.remove();
            window.cancelAnimationFrame(timer);
        }
    };
}

setInterval(() => {
    for (i = 0; i < numSnowflakes; i++) {
        if (!snowflakes[i] && Math.random() < pCreateSnowflake) {
            // Set up the timing for the snowflake
            const createdAt = performance.now();
            const duration = rand(5000, 15000);

            // Create the snowflake object
            const snowflake = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            snowflake.dataset.index = i;
            snowflake.dataset.createdAt = createdAt;
            snowflake.dataset.duration = duration;
            snowflake.setAttribute("cx", rand(0, width));
            snowflake.setAttribute("cy", 0);
            snowflake.setAttribute("r", rand(1, 5));
            snowflake.setAttribute("stroke", "none");
            snowflake.setAttribute("fill", "#ffffff");
            snowflake.setAttribute("filter", "url(#snow-blur)");

            // Add the snowflake to the screen.
            gSnowflakes.append(snowflake);

            // Add the snowflake to the collection
            snowflakes[i] = snowflake;

            // Create an animation frame for the snowflake and save the timer handle
            const timer = window.requestAnimationFrame(snowfall(snowflake));
            snowflake.dataset.timer = timer;
        }
    }
}, 100);
