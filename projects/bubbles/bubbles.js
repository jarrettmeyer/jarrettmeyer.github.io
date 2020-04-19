(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    const viewBox = [0, 0, width, height];

    const svg = d3.select("#bubbles")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", `${viewBox}`);

    svg.select("#background")
        .attr("width", width)
        .attr("height", height)
        .attr("fill", "#b4c9ed");

    const radius = 100;

    const colors = [
        "#a9fcad",
        "#c7f9ec",
        "#cdf9c7",
        "#d1a9fc",
        "#ea79ca",
        "#f9cfc7",
        "#fcf9a9",
        "#fca9f2",
    ];

    const data = new Array(3 * Math.floor(Math.min(width, height) / radius))
        .fill(0)
        .map(() => {
            return {
                cx: Math.floor(width * Math.random()),
                cy: Math.floor(height * Math.random()),
                r: radius,
                dr: Math.floor(Math.min(width, height) * Math.random()),
                speed: 5000 + Math.floor(Math.random() * 3000),
                fill: colors[Math.floor(colors.length * Math.random())],
            };
        });

    const circles = svg.selectAll("circle")
        .data(data)
        .join("circle")
        .attr("cx", d => d.cx + d.dr * Math.cos(0))
        .attr("cy", d => d.cy + d.dr * Math.sin(0))
        .attr("r", d => d.r)
        .attr("fill", d => d.fill)
        .attr("filter", "url(#blur-filter)");

    // const speedFactor = 3000;
    let lastTime = 0;

    d3.timer((now) => {
        // const t = now / speedFactor;
        const duration = now - lastTime;
        circles.transition()
            .delay(0)
            .duration(duration)
            .attr("cx", d => d.cx + d.dr * Math.cos(now / d.speed))
            .attr("cy", d => d.cy + d.dr * Math.sin(now / d.speed));
        lastTime = now;
    })
})();
