// Form fields.
const textColorInput = document.getElementById("text-color-input");
const textSizeInput = document.getElementById("text-size-input");
const offsetXInput = document.getElementById("offset-x-input");
const offsetYInput = document.getElementById("offset-y-input");
const blurInput = document.getElementById("blur-input");
const spreadInput = document.getElementById("spread-input");
const colorInput = document.getElementById("color-input");
const opacityInput = document.getElementById("opacity-input");
const insetInput = document.getElementById("inset-input");

// Filter values.
const offsetFilter = document.getElementById("offset");
const blurFilter = document.getElementById("blur");
const spreadFilter = document.getElementById("spread");
const colorFilter = document.getElementById("color");
const merge1Filter = document.getElementById("merge-1");
const merge2Filter = document.getElementById("merge-2");

// Text.
const svgText = document.getElementById("svg-text");
const tspanLine2 = document.getElementById("tspan-line-2");

const filter = document.getElementById("drop-shadow");
const filterCode = document.getElementById("filter-code");

function hex2rgb(value) {
    const r = value.substr(1, 2);
    const g = value.substr(3, 2);
    const b = value.substr(5, 2);
    return {
        r: parseInt(r, 16),
        g: parseInt(g, 16),
        b: parseInt(b, 16),
    };
}

function round(value, places) {
    const multiplier = Math.pow(10, places);
    return Math.round(value * multiplier) / multiplier;
}

function updateFilter() {
    svgText.setAttribute("fill", textColorInput.value);
    svgText.setAttribute("font-size", textSizeInput.value);
    tspanLine2.setAttribute("dy", 1 * (+textSizeInput.value));

    // Update the offset.
    offsetFilter.setAttribute("dx", offsetXInput.value);
    offsetFilter.setAttribute("dy", offsetYInput.value);

    // Update the blur.
    blurFilter.setAttribute("stdDeviation", blurInput.value);

    // Update the spread.
    spreadFilter.setAttribute("slope", spreadInput.value);

    // Update the color.
    const color = hex2rgb(colorInput.value);
    const opacity = opacityInput.value;
    colorFilter.setAttribute("values", `0 0 0 0 ${round(color.r / 255, 3)} 0 0 0 0 ${round(color.g / 255, 3)} 0 0 0 0 ${round(color.b / 255, 3)} 0 0 0 ${opacity} 0`);

    // Toggle inset.
    if (insetInput.checked) {
        merge1Filter.setAttribute("in", "SourceGraphic");
        merge2Filter.setAttribute("in", "inset");
    } else {
        merge1Filter.setAttribute("in", "color");
        merge2Filter.setAttribute("in", "SourceGraphic");
    }

    // Update the display.
    filterCode.textContent = filter.outerHTML
        .replace(/\&/g, "&amp;")
        .split("\n")
        .map(s => {
            return s.replace(/\s{16}/g, "")
                .replace(/\s{4}/g, "  ");
        })
        .join("\n");
}

textColorInput.addEventListener("input", updateFilter);
textSizeInput.addEventListener("input", updateFilter);
offsetXInput.addEventListener("input", updateFilter);
offsetYInput.addEventListener("input", updateFilter);
blurInput.addEventListener("input", updateFilter);
spreadInput.addEventListener("input", updateFilter);
colorInput.addEventListener("input", updateFilter);
opacityInput.addEventListener("input", updateFilter);
insetInput.addEventListener("input", updateFilter);

updateFilter();
