---
title:              "D3: Population"
layout:             page
permalink:          /projects/d3/population
exclude_from_nav:   true
---

The data, shown below, is population for male and female persons, by age, for the United States. As the year changes, a new dataset is fetched, and the data transitions to reflect the update.

Data is pulled from [population.io](http://population.io).

Year: <select name="year"></select>
<svg id="canvas" width="800" height="600" style="background-color:lightgray;"></svg>
<script src="https://d3js.org/d3.v5.js"></script>
<script src="/projects/d3/population/population.js"></script>
<style>
select {
  padding: 3px;
}
</style>
