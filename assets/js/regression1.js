/* jshint esversion: 6 */
(function () {

    const width = 740;
    const height = 380;
    const margin = { top: 10, bottom: 24, right: 10, left: 30 };
    const extentModifer = 0.10; // grow the extents by 10%
    const backgroundColor = "#e8e8e8";
    const borderColor = "#303030";
    const pointStroke = "#3b547c";
    const pointFill = "#547fc4";
    const pointOpacity = 0.7;
    const pointRadius = 5.0;
    const confidenceBandFill = "#85aae5";
    const confidenceBandOpacity = 0.3;
    const regressionStroke = "#506d9b";
    const interval = 0.1;

    function beta(a, b) {
        let val = 0;
        let incr = 1e-6;
        for (let i = incr; i <= 1; i += 1e-6) {
            val += incr * Math.pow(i, a - 1) * Math.pow(1 - i, b - 1);
        }
        return val;
    }

    function computeMSE(dat, c) {
        for (let i = 0; i < dat.length; i++) {
            dat[i].yhat = c[0] + c[1] * dat[i].x;
            dat[i].e = dat[i].y - dat[i].yhat;
            dat[i].esq = dat[i].e * dat[i].e;
        }
        let sse = d3.sum(dat, d => d.esq);
        let mse = sse / dat.length;
        return {
            sse: sse,
            mse: mse
        };
    }

    function computeRegressionCoefficients(dat) {
        let coef = [0, 0];
        for (let i = 0; i < dat.length; i++) {
            dat[i].xy = dat[i].x * dat[i].y;
            dat[i].xsq = dat[i].x * dat[i].x;
            dat[i].ysq = dat[i].y * dat[i].y;
        }
        let sumX = d3.sum(dat, d => d.x);
        let sumY = d3.sum(dat, d => d.y);
        let sumXY = d3.sum(dat, d => d.xy);
        let sumXSq = d3.sum(dat, d => d.xsq);
        let sumYSq = d3.sum(dat, d => d.ysq);
        let denominator = (dat.length * sumXSq) - (sumX * sumX);
        coef[0] = ((sumY * sumXSq) - (sumX * sumXY)) / denominator;
        coef[1] = ((dat.length * sumXY) - (sumX * sumY)) / denominator;
        return coef;
    }

    function getData() {

        const b = [randBetween(15, 25), randBetween(0.1, 0.5)];
        const xrange = [30, 65];
        const wiggle = [-2.0, 2.0];
        const count = [100, 150];

        function generate() {
            let x = Math.floor(randBetween(xrange[0], xrange[1]));
            let y = b[0] + b[1] * x + randBetween(wiggle[0], wiggle[1]);
            return { x: x, y: y };
        }

        let dat = [];
        let n = Math.floor(randBetween(count[0], count[1]));
        for (let i = 0; i < n; i++) {
            let val = generate();
            val.index = i;
            dat.push(val);
        }
        return dat;
    }

    function randBetween(min, max) {
        return min + (max - min) * Math.random();
    }

    let t = {
        pdf: function (x, n) {
            let a = 1 + (x * x / n);
            let b = -1 * (n + 1) / 2;
            let c = beta(0.5, 0.5 * n);
            let d = Math.sqrt(n);
            return Math.pow(a, b) / (c * d);
        }
    };

    let data = getData();
    let xbar = d3.sum(data, d => d.x);

    let canvas = d3.select("#canvas")
                   .attr("width", width)
                   .attr("height", height)
                   .style("border", `1px solid ${borderColor}`)
                   .style("background-color", backgroundColor)
                   .append("g")
                   .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const xextent = d3.extent(data, d => d.x);
    const yextent = d3.extent(data, d => d.y);

    const xscale = d3.scaleLinear()
                     .domain(xextent)
                     .range([0, width - margin.left - margin.right]);
    const yscale = d3.scaleLinear()
                     .domain(yextent)
                     .range([height - margin.top - margin.bottom, 0]);

    let xaxis = d3.axisBottom(xscale);
    canvas.append("g")
          .attr("transform", `translate(0, ${height - margin.top - margin.bottom})`)
          .call(xaxis);
    let yaxis = d3.axisLeft(yscale);
    canvas.append("g")
          .attr("transform", `translate(0, 0)`)
          .call(yaxis);

    let points = canvas.selectAll("circle")
                       .data(data)
                       .enter()
                       .append("circle")
                       .attr("stroke", pointStroke)
                       .attr("stroke-opacity", pointOpacity)
                       .attr("stroke-width", 1.0)
                       .attr("fill", pointFill)
                       .attr("opacity", pointOpacity)
                       .attr("cx", d => xscale(d.x))
                       .attr("cy", d => yscale(d.y))
                       .attr("r", pointRadius);

    let c = computeRegressionCoefficients(data);
    let error = computeMSE(data, c);
    let stErrorEstimate = Math.sqrt(error.sse / (data.length - 2));

    let rline = [];
    for (let i = xextent[0]; i <= xextent[1]; i += interval) {
        let r = { x: i, yhat: c[0] + c[1] * i };
        let a = 1 / data.length;
        let b = Math.pow(i - xbar, 2) / error.sse;
        r.stErrorRegression = stErrorEstimate * Math.sqrt(a + b);
        rline.push(r);
    }
    let regressionline = d3.line()
                           .x(d => xscale(d.x))
                           .y(d => yscale(d.yhat));

    canvas.append("path")
          .datum(rline)
          .attr("d", regressionline)
          .attr("stroke", regressionStroke)
          .attr("stroke-width", 2.0);

    canvas.append("text")
          .text(`y = ${Math.round(c[0] * 100)/100} + ${Math.round(c[1] * 100)/100}x`)
          .attr("font-size", 10)
          .attr("x", 10)
          .attr("y", 12);

    points.raise();

    window.beta = beta;
    window.t = t;

})();
