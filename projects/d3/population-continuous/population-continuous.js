(function () {

    // Variables.
    const BASE_URL = "http://api.population.io/1.0/";
    const MIN_YEAR = 1950;
    const MAX_YEAR = (new Date()).getFullYear();
    const TRANSITION_DURATION = 500;
    const COUNTRY = "United States";
    const MAX_POPULATION = 5 * 1e6;
    const MAX_AGE = 100;
    const STROKE_WIDTH = 3.0;
    
    let year = MIN_YEAR;
    let padding = {
        top: 20,
        bottom: 30,
        left: 50,
        right: 20
    };
    let malePath = femalePath = null;
    let maleArea = femaleArea = null;    
    let fetchOptions = {};
    
    let populationData = {};

    // Select the D3 SVG element, and compute the width & height.
    let svg = d3.select("#canvas");
    let width = +svg.attr("width") - padding.left - padding.right;
    let height = +svg.attr("height") - padding.top - padding.bottom;

    // Define the X and Y scales. The coordinates begin with (0, 0) in the
    // top-left, so we define the height scale backwards.
    let xScale = d3.scaleLinear().range([0, width]).domain([0, MAX_AGE]);
    let xAxis = d3.axisBottom(xScale);
    let yScale = d3.scaleLinear().range([height, 0]).domain([0, MAX_POPULATION]);    
    let yAxis = d3.axisLeft(yScale).tickFormat(d3.format(".2s"));

    // Apply an offset grouping.
    let paddingGroup = svg.append("g")
        .attr("transform", "translate(" + padding.left + ", " + padding.top + ")");
    paddingGroup.append("g")
        .attr("class", "axis x-axis")
        .attr("transform", "translate(0, " + height + ")")
        .call(xAxis);
    paddingGroup.append("g")
        .attr("class", "axis y-axis")
        .attr("transform", "translate(0, 0)")
        .call(yAxis);

    // Define the male and female lines. Since we want to draw the female line on
    // top of the male line, we will add the values.
    let maleLine = d3.line()
        .x(d => xScale(d.age))
        .y(d => yScale(d.males));
    let femaleLine = d3.line()
        .x(d => xScale(d.age))
        .y(d => yScale(d.males + d.females));
    let text = svg.append("text")
        .attr("x", width - 100)
        .attr("y", 30)
        .attr("font-size", 14)
        .text("Year: null");

    

    /**
     * 
     */
    function draw(data) {
        let areaData = fixUpData(data);

        // Draw the female and male areas.
        femaleArea = paddingGroup.append("path")
            .attr("class", "female-area")
            .attr("transform", "translate(1, -1)")
            .attr("fill", "salmon")
            .datum(areaData)
            .attr("d", femaleLine);
        maleArea = paddingGroup.append("path")
            .attr("class", "male-area")    
            .attr("transform", "translate(1, -1)")
            .attr("fill", "lightblue")
            .datum(areaData)
            .attr("d", maleLine);

        // Draw the male and female lines.
        femalePath = paddingGroup.append("path")
            .attr("transform", "translate(1, -1)")
            .attr("fill", "none")
            .attr("stroke", "darkred")
            .attr("stroke-width", STROKE_WIDTH)
            .datum(data)
            .attr("d", femaleLine);
        malePath = paddingGroup.append("path")
            .attr("transform", "translate(1, -1)")
            .attr("fill", "none")
            .attr("stroke", "darkblue")
            .attr("stroke-width", STROKE_WIDTH)
            .datum(data)
            .attr("d", maleLine);

        text.text(`Year: ${year}`);
    }


    /**
     * Fetch data. If this is the first fetch, then draw the data set. If this is
     * not the first fetch, then transition the data.
     */
    function fetchData(year) {
        // If we already have the data, there is no need to fetch the data a second
        // time.        
        if (populationData[year]) {
            transition(populationData[year]);
        }
        else {
            let url = `${BASE_URL}population/${year}/${COUNTRY}/`;
            d3.json(url, fetchOptions)
                .then(function (json) {
                    populationData[year] = json;
                    if (!malePath && !femalePath) {
                        draw(json);
                    }
                    else {
                        transition(json);
                    }
                })
                .catch(console.error);
        }
    }


    /**
     * Fix up the data. We need to add two data points, one at the beginning and
     * one at the end.
     */
    function fixUpData(json) {
        var data = json.map(j => j);
        data.push({ age: d3.max(json, d => d.age), males: 0, females: 0, total: 0 });
        data.push({ age: d3.min(json, d => d.age), males: 0, females: 0, total: 0 });
        return data;
    }


    function transition(data) {
        var areaData = fixUpData(data);
        femaleArea.transition().duration(TRANSITION_DURATION).ease(d3.easeLinear).attr("d", femaleLine(areaData));
        maleArea.transition().duration(TRANSITION_DURATION).ease(d3.easeLinear).attr("d", maleLine(areaData));
        femalePath.transition().duration(TRANSITION_DURATION).ease(d3.easeLinear).attr("d", femaleLine(data));
        malePath.transition().duration(TRANSITION_DURATION).ease(d3.easeLinear).attr("d", maleLine(data));
        text.text(`Year: ${year}`);
    }


    // Set the year input to the current year and fetch data for the first time.
    fetchData(year);
    setInterval(function () {
        year = (year < MAX_YEAR) ? year + 1 : MIN_YEAR;
        fetchData(year);
    }, TRANSITION_DURATION);

})();
