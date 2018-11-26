(function () {
  
    const TITLE_FONT = "monospace";
    const TITLE_FONT_SIZE = 12;
    const TITLE_HEIGHT = 50;
    const COUNT = 200;
    const BAR_COLOR = "lightgray";
    const READ_COLOR = "mediumorchid"
    const WRITE_COLOR = "steelblue";
    const DELAY_INTERVAL = 1;
  
    function draw() {
        let bars = [];
        for (let i = 0; i < COUNT; i++) {
            let bar = drawArea.append("rect")
                .attr("x", scaleX(i))
                .attr("y", scaleY(1 - randoms[i]))
                .attr("width", barWidth)
                .attr("height", scaleY(randoms[i]))
                .attr("index", i)
                .attr("value", randoms[i])
                .attr("fill", BAR_COLOR);
            bars.push(bar);
        }
        return bars;
    }
  
  function generateRandomData(n) {
    let arr = [];
    for (let i = 0; i < n; i++) {
      arr.push(Math.random());
    }
    return arr;
  }
  
    function readBar(bar) {
        bar.attr("fill", READ_COLOR);
        return +bar.attr("value");
    }
  
    function writeBar(bar) {
        bar.attr("fill", WRITE_COLOR);
    }
  
    function doneBar(bar) {
        bar.attr("fill", BAR_COLOR);
    }
  
    function swapXPosition(barA, barB) {
        let a = +barA.attr("x");
        let b = +barB.attr("x");
        barA.attr("x", b);
        barB.attr("x", a);
    }
  
    let canvas = d3.select("#canvas");
    let width = +canvas.attr("width");
    let height = +canvas.attr("height");
    let barHeight = height - TITLE_HEIGHT;
    let barWidth = width / COUNT;
  
    let scaleX = d3.scaleLinear().domain([0, COUNT]).range([0, width]);
    let scaleY = d3.scaleLinear().domain([0, 1]).range([0, barHeight]);
  
    let randoms = generateRandomData(COUNT);
  
    let drawArea = canvas.append("g").attr("transform", `translate(0, ${TITLE_HEIGHT})`);
  
    let bars = draw();
    let i = j = 0;
    let interval = setInterval(function () {
        let val1 = readBar(bars[j]);
        let val2 = readBar(bars[j + 1]);
        if (val1 > val2) {
            let swap = bars[j];
            bars[j] = bars[j + 1];
            bars[j + 1] = swap;
            writeBar(bars[j]);
            writeBar(bars[j + 1]);
            swapXPosition(bars[j], bars[j + 1]);
        }
        j++;
        if (j >= bars.length - i - 1) {
            i++;
            j = 0;
        }
        if (i >= bars.length - 1) {
            clearInterval(interval);            
        }
    }, DELAY_INTERVAL);
  
})();
