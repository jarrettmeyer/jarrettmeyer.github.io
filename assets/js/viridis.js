$(document).ready(() => {
    console.log("Starting script...");
    let paletteControls = $("#palette-controls");
    let paletteGradient = $("#palette-gradient");
    let paletteValues = $("#palette-values");

    // Add user controls.
    let label = $("<label style=\"color:#303030;\">Number of values:</label>")
    let input = $("<input type=\"number\" id=\"count\" min=\"2\" value=\"12\" max=\"256\" style=\"width:5em;padding:3px;margin-left:3px;\"/>");
    paletteControls.append(label);
    paletteControls.append(input);

    let viridis = d3.interpolateViridis;

    // Update the gradient.
    let background = "linear-gradient(90deg";
    let stops = [0, 0.25, 0.5, 0.75, 1.0];
    for (let i = 0; i <= 1.0; i += 0.10) {
        let pct = i * 100;
        background += ", " + viridis(i) + " " + pct + "%";
    }
    background += ")";
    console.log("background:", background);
    paletteGradient.css("background", background);


    function update() {
        paletteValues.html("");
        let count = +($("#count").val());
        if (count < 2) {
            count = 2;
            $("#count").val(2);
        }
        else if (count > 256) {
            count = 256;
            $("#count").val(256);
        }
        console.log("count:", count);
        for (i = 0; i < count; i++) {
            let max = count - 1;
            let ratio = i / max;
            let hex = viridis(ratio);
            let value = "<div style=\"margin-top:1em;\">";
            value += "<div style=\"width:4em;height:4em;display:inline-block;background:" + hex + ";\">";
            value += "</div>";
            value += "<div style=\"display:inline-block;margin-left:1em;vertical-align:top;\">"
            value += "<p style=\"margin-bottom:0.5em;\">" + hex + "</p>";
            value += "<p style=\"margin-bottom:0.5em;\">rgb(";
            value += parseInt(hex.slice(1, 3), 16) + ", ";
            value += parseInt(hex.slice(3, 5), 16) + ", ";
            value += parseInt(hex.slice(5, 7), 16) + ")</p>";
            value += "</div>";
            value += "</div>";
            paletteValues.append(value);
        }
    }

    input.on("blur", update);
    input.on("change", update);
    input.on("keyup", update);

    update();
    console.log("Done reading script...");
});