const inputColorInput = document.querySelector("#input-color");
const inputColorValue = document.querySelector("#input-color-value");
const circle = document.querySelector("#my-circle");
const matrix = document.querySelector("#matrix");
const filter = document.querySelector("#fe-color-matrix");
const updateButton = document.querySelector("#update-button");

function updateCircle() {
    let inputColor = inputColorInput.value;
    inputColorValue.textContent = inputColor;
    circle.setAttribute("fill", inputColor);

    let matrixValue = matrix.value.replace(/\n/g, " ");
    filter.setAttribute("values", matrixValue);
}

updateButton.addEventListener("click", () => {
    updateCircle();
});
