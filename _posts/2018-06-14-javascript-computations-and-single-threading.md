---
title: "JavaScript, Computations, and Single Threading"
layout: post
date: 2018-06-14
description:
thumbnail: /assets/images/javascript-logo.svg
---

Most of the time, JavaScript and the browser DOM act exactly as you would expect. There are no surprises. Sometimes, though, when you are surprised, it is painful.

Under this paragraph, there is a block of text that you cannot see. Why can't you see it? Because the CSS has an `opacity: 0` setting.

<div id="block1" style="background-color: #abc6f2; color: #113877; padding: 6px 10px; opacity: 0; border: 1px solid #113877; border-radius: 5px; margin-bottom: 10px;">Doing very important stuff...</div>

Here, we have a button.

<button id="clicker1">Click Me</button>

<p id="duration1">-----</p>

What _should_ happen when we click this button?

1. Show the block.
2. Do some computational work.
3. Hide the block.

Try it and see what happens. Here's the code for this button.

```js
$("#clicker1").on("click", function() {
    $("#block1").css("opacity", 1);
    let maxDuration = 2000;
    let startTime = Date.now();
    let endTime = Date.now();
    let array = [];
    while (!endTime || endTime - startTime < maxDuration) {
        let x = Math.random() * 100;
        let s = x.toFixed(3);
        array.push(s);
        endTime = Date.now();
    }
    let duration = "Done in " + ((endTime - startTime) / 1000).toFixed(3) + " seconds";
    $("#duration1").text(duration);
    $("#block1").css("opacity", 0);
});
```

Hmmm... None of that worked as expected. Why? Remember: JavaScript is single-threaded. We never gave the thread time to update the screen.

Let's try again, this time using the `setTimeout` function to give the call stack time to update the browser.

<div id="block2" style="background-color: #ffc9c9; color: #a02020; padding: 6px 10px; opacity: 0; border: 1px solid #a02020; border-radius: 5px; margin-bottom: 10px;">Doing very important stuff...</div>
<button id="clicker2">Click Me</button>

<p id="duration2">-----</p>

What did we do differently?

```js
$("#clicker2").on("click", function() {
    $("#block2").css("opacity", 1);
    setTimeout(function() {
        let maxDuration = 2000;
        let startTime = Date.now();
        let endTime = null;
        let array = [];
        while (!endTime || endTime - startTime < maxDuration) {
            let x = Math.random() * 100;
            let s = x.toFixed(3);
            array.push(s);
            endTime = Date.now();
        }
        let duration = "Done in " + ((endTime - startTime) / 1000).toFixed(3) + " seconds";
        $("#duration2").text(duration);
        $("#block2").css("opacity", 0);
    }, 0);
});
```

So why does this work? The `setTimeout` function adds the next round of operations on the end of the call stack. This gives the jQuery DOM operation time to run, meaning: the UI has time to update. Unfortunately, this is just one of those annoying little things that can happen when working with the browser, and it's a handy solution to keep around.

<script src="https://unpkg.com/jquery@3.3.1/dist/jquery.js"></script>
<script src="/assets/js/show-hide-delay.js"></script>
