(() => {
    let width = window.innerWidth;
    const height = window.innerHeight;

    let divisor = 10;
    width = Math.floor(width / divisor) * divisor;
    const pathPointCount = Math.floor(width / divisor);

    console.log(`size: ${width} x ${height}`);

    const svg = d3.select("#visual")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", `${[0, 0, width, height]}`);

    const amplitudeMin = 10;
    const amplitudeMax = 25;
    const waveCount = Math.floor((amplitudeMin + amplitudeMax) / 2);

    function color(i) {
        // I really like the depth from the first 80% of the plasma color scheme.
        // Also, let's flip the scheme around.
        const lowerBound = 0.8;
        const upperBound = 0;
        const x = lowerBound + (upperBound - lowerBound) * (i / waveCount);
        return d3.interpolatePlasma(x);
    }

    const waveData = new Array(waveCount)
        .fill(0)
        .map((_, i) => {
            return {
                index: i,
                fill: color(i),
                amplitude: amplitudeMin + (amplitudeMax - amplitudeMin) * Math.random(),
                spread: 10 + i * 1.2 * Math.random(),
                speed: -0.0002 - i * 0.0001 * Math.random(),
                cy: (i + 1) / (waveCount + 1) * height,
            };
        });

    const area = d3.area()
        .x(d => d.x)
        .y1(d => d.y)
        .y0(height);

    function pathGenerator(wave, t) {
        const path = new Array(pathPointCount + 1)
            .fill(0)
            .map((_, i) => {
                return {
                    x: i * divisor,
                    y: wave.cy + wave.amplitude * Math.sin(i / wave.spread + t * wave.speed),
                };
            });
        return area(path);
    }

    svg.append("rect")
        .attr("stroke", "none")
        .attr("fill", color(0))
        .attr("x", "0")
        .attr("y", "1")
        .attr("width", width)
        .attr("height", height);

    let path = svg.selectAll("path")
        .data(waveData)
        .join("path")
        .attr("stroke", "none")
        .attr("fill", d => d.fill)
        .attr("d", d => pathGenerator(d, 0));

    let previous = 0;

    function animate(t) {
        const duration = t - previous;
        path = path.transition()
            .duration(duration)
            .delay(0)
            .attr("d", d => pathGenerator(d, t));
        previous = t;
        window.requestAnimationFrame(animate);
    }

    window.requestAnimationFrame(animate);
})();
