(function () {

    function draw(data) {
        let gData = canvas.select("g.data");
        if (gData.empty()) {
            gData = canvas.append("g")
                .attr("class", "data")
                .attr("transform", `translate(${margin.left}, ${margin.top})`);
        }

        let bars = gData.selectAll("rect").data(data);

        bars.enter()
            .append("rect")
            .attr("fill", d => color[d.source])
            .attr("x", 0)
            .attr("y", d => yScale(d.source))
            .attr("height", yScale.bandwidth())
            .attr("width", d => xScale(d.cost));
        
        bars.merge(bars)
            .transition()
            .duration(1000)
            .ease(d3.easeCubicInOut)
            .attr("width", d => xScale(d.cost));

        bars.exit().remove();
    }

    function getTitle(d) {
        let fmt = d3.format(",");
        return `Cost of Diabetes Total ${years[yearIndex]} US$ ${fmt(sumCost(d))} million`;
    }

    function reduceUnique(p, c) {
        if (p.indexOf(c) === -1) {
            p.push(c);
        }
        return p;
    }

    function sumCost(d) {
        let sum = 0;
        for (let i = 0; i < d.length; i++) {
            sum += d[i].cost;
        }
        return sum;
    }

    let margin = {
        bottom: 20,
        left: 120,
        right: 25,
        top: 20
    };

    let canvas = d3.select("#bar-chart");
    let width = +canvas.attr("width");
    let height = +canvas.attr("height");

    let data = [
        [2007, "Inpatient Care", 65830],
        [2007, "Outpatient Care", 22742],
        [2007, "Medication and Supplies", 27684],
        [2007, "Reduced Productivity", 23400],
        [2007, "Reduced Labor Force", 7900],
        [2007, "Early Mortality", 26900],
        [2012, "Inpatient Care", 90652],
        [2012, "Outpatient Care", 31798],
        [2012, "Medication and Supplies", 52306],
        [2012, "Reduced Productivity", 28500],
        [2012, "Reduced Labor Force", 21600],
        [2012, "Early Mortality", 18500],
        [2017, "Inpatient Care", 76164],
        [2017, "Outpatient Care", 54001],
        [2017, "Medication and Supplies", 107104],
        [2017, "Reduced Productivity", 32500],
        [2017, "Reduced Labor Force", 37500],
        [2017, "Early Mortality", 19900]
    ].map(row => {
        return {
            year: row[0],
            source: row[1],
            cost: row[2]
        };
    });

    let sources = data.map(row => row.source).reduce(reduceUnique, []);
    let years = data.map(row => row.year).reduce(reduceUnique, []);

    let color = {};
    sources.forEach((source, index) => {
        color[source] = d3.schemeSet2[index];
    });

    let xScale = d3.scaleLinear()
        .domain([0, 120000])
        .range([0, width - margin.left - margin.right]);

    let xAxis = d3.axisBottom(xScale);

    let yScale = d3.scaleBand()
        .domain(sources)
        .range([0, height - margin.top - margin.bottom])
        .padding(0.2);
    let yAxis = d3.axisLeft(yScale);

    let yearIndex = 0;
    let yearData = data.filter(d => d.year === years[yearIndex]);
    draw(yearData);

    let title = canvas.append("text")
        .attr("font-size", 14)
        .attr("x", margin.left)
        .attr("y", margin.top / 2)
        .text(getTitle(yearData));
    
    canvas.append("g").attr("class", "x-axis").attr("transform", `translate(${margin.left}, ${height - margin.bottom})`).call(xAxis);
    canvas.append("g").attr("class", "y-axis").attr("transform", `translate(${margin.left}, ${margin.top})`).call(yAxis);
    canvas.selectAll(".y-axis .tick line").remove();

    setInterval(() => {
        yearIndex = (yearIndex === years.length - 1) ? 0 : yearIndex + 1;
        yearData = data.filter(d => d.year === years[yearIndex]);
        draw(yearData);
        title.text(getTitle(yearData));
    }, 3000);

})();
