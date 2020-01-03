---
title: "SVG Drop Shadows"
layout: page
permalink: /projects/svg/drop-shadow/
exclude_from_nav: true
custom_css: /projects/svg/drop-shadow/drop-shadow.css
---

This demo shows how to create SVG filters to create drop shadows on SVG objects.

<div class="flex-row">
    <div class="flex-column-1">
        <div class="input-group">
            <label>Text Color</label>
            <input type="color" id="text-color-input" value="#111111" />
        </div>
        <div class="input-group">
            <label>Text Size</label>
            <input type="range" id="text-size-input" value="100" min="1" max="200" step="1" />
        </div>
        <div class="input-group">
            <label>Offset X</label>
            <input type="range" id="offset-x-input" value="3" min="-30" max="30" step="1" />
        </div>
        <div class="input-group">
            <label>Offset Y</label>
            <input type="range" id="offset-y-input" value="3" min="-30" max="30" step="1" />
        </div>
        <div class="input-group">
            <label>Blur</label>
            <input type="range" id="blur-input" value="3" min="0" max="20" step="0.1" />
        </div>
        <div class="input-group">
            <label>Spread</label>
            <input type="range" id="spread-input" value="1" min="0" max="5" step="0.1" />
        </div>
        <div class="input-group">
            <label>Drop Shadow Color</label>
            <input type="color" id="color-input" value="#51c1eb" />
        </div>
        <div class="input-group">
            <label>Opacity</label>
            <input type="range" id="opacity-input" value="0.5" min="0" max="1" step="0.01" />
        </div>
        <div class="input-group">
            <label>Inset?</label>
            <input type="checkbox" id="inset-input" />
        </div>
    </div>
    <div class="flex-column-2">
        <svg width="100%" viewBox="0 0 600 600">
            <defs>
                <filter id="drop-shadow" x="-100%" y="-100%" width="300%" height="300%">

                    <!-- Defines the offset of the drop shadow. -->
                    <feOffset id="offset" in="SourceAlpha" dx="3" dy="3" result="offset" />

                    <!-- Define the blur and spread of the drop shadow. -->
                    <feGaussianBlur id="blur" in="offset" stdDeviation="3" result="blur" />
                    <feComponentTransfer in="blur" result="spread">
                        <feFuncA id="spread" type="linear" slope="1"/>
                    </feComponentTransfer>

                    <!-- Define the color of the drop shadow. -->
                    <feColorMatrix id="color" in="spread" type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 .8 0" result="color"/>

                    <!-- Create the composites for an inset drop shadow. -->
                    <feComposite id="inverse" in="SourceGraphic" in2="spread" operator="out" result="inverse" />
                    <feComposite in="color" in2="inverse" operator="in" result="inset" />

                    <!-- Merge the filters into the final product. -->
                    <feMerge>
                        <feMergeNode id="merge-1" in="color" />
                        <feMergeNode id="merge-2" in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>
            <text y="50" filter="url(#drop-shadow)" font-size="72" font-weight="bold" fill="#111111" id="svg-text" dominant-baseline="hanging">
                <tspan x="50">SVG</tspan>
                <tspan x="50" dy="70" id="tspan-line-2">Text</tspan>
            </text>
        </svg>
    </div>

</div>

<pre id="filter-code"></pre>

<script src="/projects/svg/drop-shadow/drop-shadow.js"></script>
