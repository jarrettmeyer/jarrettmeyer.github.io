---
title: "Reading a File with JavaScript"
layout: "post"
date: 2018-08-28
description:
thumbnail: /assets/images/javascript-logo.svg
---

In my project, we wanted to be able to parse a CSV file on the client. Fortunately, JavaScript has added `FileReader` features, and the [D3 library](https://d3js.org) brings with it a very good CSV parser.

The easiest way to work this this file is given below. We create a new `FileReader` instance, and read the file as text. The file input will have a `text` array, with the first element containing the context of the text. The `reader` instance will have a `result` property.

```js
$(".file-input").on("change", () => {
    let reader = new FileReader();
    reader.readAsText($("#file-input")[0].text[0]);
    reader.onload = () => {
        console.log(reader.result);
    };
});
```

You can test this script with the form below. If you need a sample CSV file to test this script, you can [download one here](https://github.com/jarrettmeyer/jarrettmeyer.github.io/raw/master/assets/csv/teams.csv). The file comes from [Sean Lahman's Baseball Archive](http://www.seanlahman.com/baseball-archive/statistics/).

<form>
<div style="margin-bottom: 0.5em;"><input type="file" id="file-input" class="file-input" /></div>
<div style="margin-bottom: 0.5em;"><label><input type="checkbox" id="header" class="file-input" checked="checked" />Header?</label></div>
</form>

<div id="file-preview" style="border: 1px solid #666; min-height: 1em; margin-bottom: 1em;"></div>

The complete code is [available on Github](https://github.com/jarrettmeyer/jarrettmeyer.github.io/blob/master/assets/js/reading-a-file-with-javascript.js).

<script src="/assets/js/jquery/3.3.1/jquery.min.js"></script>
<script src="/assets/js/d3/5.6.0/d3.min.js"></script>
<script src="/assets/js/reading-a-file-with-javascript.js"></script>
