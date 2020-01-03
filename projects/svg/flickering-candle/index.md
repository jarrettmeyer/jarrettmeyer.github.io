---
title: "SVG Flickering Candle"
layout: page
permalink: /projects/svg/flickering-candle/
exclude_from_nav: true
---

<svg id="view" viewBox="0 0 1600 900" style="width: 100%;">
    <defs>
        <linearGradient id="candlestick-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="4%" stop-color="#ff9224" />
            <stop offset="20%" stop-color="#58523a" />
        </linearGradient>
        <filter id="candlestick-filter">
            <!-- background-glow -->
            <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
            <feOffset dx="0" dy="0" result="offset-blur" />
            <feFlood flood-color="#ff6a00" flood-opacity="1" />
            <feComposite in2="offset-blur" operator="in" result="background-glow" />

            <!-- inset-yellow -->
            <feGaussianBlur in="SourceAlpha" stdDeviation="4.5" />
            <feOffset dx="0" dy="10" />
            <feComposite in="SourceGraphic" operator="out" result="inverse" />
            <feFlood flood-color="#fbf348" flood-opacity="1" />
            <feComposite in2="inverse" operator="in" result="inset-yellow" />
            <feComponentTransfer>
                <feFuncA type="gamma" exponent="0.5" amplitude="2" />
            </feComponentTransfer>

            <!-- inset-red -->
            <feGaussianBlur in="SourceAlpha" stdDeviation="20" />
            <feOffset dx="0" dy="12"/>
            <feComposite in="SourceGraphic" operator="out" result="inverse" />
            <feFlood flood-color="#ff0000" flood-opacity="0.4" />
            <feComposite in2="inverse" operator="in" result="inset-red" />

            <!-- inset-black -->

            <feMerge>
                <feMergeNode in="background-glow" />
                <feMergeNode in="SourceGraphic" />
                <feMergeNode in="inset-yellow" />
                <!--<feMergeNode in="inset-red" />-->
            </feMerge>
        </filter>
    </defs>
    <rect id="background"
        x="0" y="0" width="1600" height="900"
        fill="#111111" stroke="none" />
    <g id="candle">
        <path id="candlestick"
            d="m 770 900 v -488 a 12 12 0 0 1 12 -12 h 46 a 12 12 0 0 1 12 12 v 488 z"
            fill="url(#candlestick-fill)"
            filter="url(#candlestick-filter)" />
    </g>

</svg>

<!-- <script src="https://unpkg.com/d3@5.15.0/dist/d3.min.js"></script> -->
<!-- <script src="/projects/svg/flickering-candle/flickering-candle.js"></script> -->
