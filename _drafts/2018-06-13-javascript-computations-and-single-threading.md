---
title:      "JavaScript, Computations, and Single Threading"
layout:     post
date:       2018-06-13
---

Most of the time, JavaScript and the browser DOM act exactly as you would expect. There are no surprises. Sometimes, though, when you are surprised, it is painful.

Under this paragraph, there is a block of text that you cannot see. Why can't you see it? Because the CSS has an `opacity: 0` setting.

<div id="block" style="background-color: #abc6f2; color: #113877; padding: 6px 10px; opacity: 0; border: 1px solid #113877; border-radius: 5px; margin-bottom: 10px;">Doing very important stuff...</div>

Here, we have a button.

<button id="clicker1">Click Me</button>
<div id="duration1">-----</div>

```js
$("#clicker1").on("click", function () {

});
```

<button id="clicker2">Click Me</button>
<div id="duration2">-----</div>

<script src="https://unpkg.com/jquery@3.3.1/dist/jquery.js"></script>
<script src="/assets/js/jquery-show-hide.js"></script>
