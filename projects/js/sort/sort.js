(function () {
  
  const titleFont = "monospace";
  const titleFontSize = 12;
  const titleHeight = 50;
  const count = 50;
  const barColor = "#d7d7d7";
  const readColor = "#c83f3f"
  const writeColor = "#1f8e1b";
  
  function draw() {
    let bars = [];
    for (let i = 0; i < count; i++) {
      let bar = drawArea.append("rect")
          .attr("x", scaleX(i))
          .attr("y", scaleY(1 - randoms[i]))
          .attr("width", barWidth)
          .attr("height", scaleY(randoms[i]))
          .attr("index", i)
          .attr("value", randoms[i])
          .attr("fill", barColor);
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
    bar.attr("fill", readColor);
    return +bar.attr("value");
  }
  
  function writeBar(bar) {
    bar.attr("fill", writeColor);
  }
  
  function doneBar(bar) {
    bar.attr("fill", barColor);
  }
  
  function swapXPosition(barA, barB) {
    writeBar(barA);
    writeBar(barB);
    a = +barA.attr("x");
    b = +barB.attr("x");
    barA.attr("x", b);
    barB.attr("x", a);
  }
  
  function bubbleSort(bars) {
    for (let i = 0; i < bars.length - 1; i++) {
      for (let j = 0; j < bars.length - i - 1; j++) {
        let val1 = readBar(bars[j]);
        let val2 = readBar(bars[j + 1]);
        if (val1 > val2) {
          let swap = bars[j];
          bars[j] = bars[j + 1];
          bars[j + 1] = swap;
          swapXPosition(bars[j], bars[j + 1]);
        }
        // doneBar(bars[j]);
        // doneBar(bars[j + 1]);
      }
    }
  }
  
  let canvas = d3.select("#canvas");
  let width = +canvas.attr("width");
  let height = +canvas.attr("height");
  let barHeight = height - titleHeight;
  let barWidth = width / count;
  
  let scaleX = d3.scaleLinear().domain([0, count]).range([0, width]);
  let scaleY = d3.scaleLinear().domain([0, 1]).range([0, barHeight]);
  
  let randoms = generateRandomData(count);
  
  let drawArea = canvas.append("g").attr("transform", `translate(0, ${titleHeight})`);
  
  let bars = draw();
  setTimeout(function () {
    bubbleSort(bars);
  }, 1000);
  
})();