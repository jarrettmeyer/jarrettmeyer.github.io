---
title: "SVG feColorMatrix"
layout: page
permalink: /projects/svg/feColorMatrix/
exclude_from_nav: true
---

Working with [feColorMatrix](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feColorMatrix) allows you to create a transform from one color to another.

### Applying a Color Matrix

<div style="margin-bottom: 1em;">
    <label style="display: block;">Input Color (hex)</label>
    <input type="color" id="input-color" value="#51c1eb">
    <span id="input-color-value">#51c1eb</span>
</div>

<div style="margin-bottom: 1em;">
    <label style="display: block;">Matrix</label>
    <textarea id="matrix" rows="4" style="font-size: 16px; font-family: Monaco, Consolas, monospace;">1  0  0  0  0
0  1  0  0  0
0  0  1  0  0
0  0  0  1  0</textarea>
</div>

<button id="update-button" type="button">Update</button>

<svg id="view" width="300" height="300">
    <defs>
        <filter id="color-filter">
            <feColorMatrix id="fe-color-matrix" in="SourceGraphic" type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 1 0" />
        </filter>
    </defs>
    <circle id="my-circle" cx="150" cy="150" r="100" fill="#51c1eb" filter="url(#color-filter)" />
</svg>

<script src="/projects/svg/feColorMatrix/feColorMatrix.js"></script>
