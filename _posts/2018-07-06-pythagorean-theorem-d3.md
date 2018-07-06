---
title:      "A Visual Proof of the Pythagorean Theorem in D3"
layout:     post
date:       2018-07-06
---

Slide the green dot up and down the left hand side of the canvas.

<svg id="canvas"></svg>

We have two squares that are the same size. If they are the same size, then they must have the same area. The two squares on the left side represent \\( a^2 \\) and \\( b^2 \\), and the square on the right is \\( c^2 \\). Each triangle is a right triangle with legs of length \\( a \\) and \\( b \\). That means that each triangle has area \\( \frac{1}{2} ab \\).

\begin{align}
\left( left \right) ^ {2} &= \left( right \right) ^ {2} \\\
\left( a + b \right) ^ {2} &= c^{2} + 4 \times \left( \frac{1}{2} ab \right) \\\
a^{2} + 2ab + b^{2} &= c^{2} + 2ab \\\
\end{align}

That's it. Have fun playing!

<script src="/assets/js/jquery/3.3.1/jquery.min.js"></script>
<script src="/assets/js/d3/5.5.0/d3.js"></script>
<script src="/assets/js/pythagorean-theorem.js"></script>
