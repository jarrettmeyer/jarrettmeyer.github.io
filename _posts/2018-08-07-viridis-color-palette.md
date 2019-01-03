---
title:      "Viridis Color Palette"
layout:     "post"
date:       2018-08-07
tags:       d3js
---

The viridis color palette was developed in 2015 for `matplotlib` by Stefan van der Walt and Nathaniel Smith. It is designed to be

* **Colorful**
* **Perceptually uniform**
* **Robust to colorblindness**
* **Pretty**

You can see their talk [on YouTube](https://www.youtube.com/watch?list=PLYx7XA2nY5Gcpabmu61kKcToLz0FapmHu&v=xAoljeRJ3lU) (19 min) to learn more about how they developed the color palette.

The viridis color palette can be accessed in [D3](https://d3js.org) with the `d3.interpolateViridis()` function.

A copy of this code can be found [in Github](https://github.com/jarrettmeyer/jarrettmeyer.github.io/blob/master/assets/js/viridis.js).

<div id="palette-controls"></div>

<div id="palette-gradient" style="height:2em;width:100%;margin-top:1em;"></div>

<div id="palette-values"></div>

<script type="text/javascript" src="/assets/js/jquery/3.3.1/jquery.min.js"></script>
<script type="text/javascript" src="/assets/js/d3/5.5.0/d3.js"></script>
<script type="text/javascript" src="/assets/js/viridis.js"></script>
