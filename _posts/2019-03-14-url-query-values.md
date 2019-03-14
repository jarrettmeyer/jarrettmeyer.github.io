---
title:      "Getting URL Query Values"
date:       2019-03-14
layout:     post
tags:       javascript
---

This was a fun little task. I needed to get URL query values. This is a pretty common requirement, so I thought I would document it's use here. The easiest way to do this is by creating an instance of [URLSearchParams](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams).

Click the button to create a token and reload the page.

<button type="button" id="reload">Reload Page</button>

### Search Params

<ul id="output"></ul>

```js
let search = new URLQueryParams(window.location.search);

let output = document.getElementById("output");
let html = "";
search.forEach((value, key) => {
    html += `<li><strong>${key}:</strong> ${value}</li>`;
});
output.innerHTML = html;
```

You can get a single value from the query with the `get()` function.

```js
let token = search.get("token");
```

The complete code for this page is [available in Github](https://github.com/jarrettmeyer/jarrettmeyer.github.io/blob/master/assets/js/urlquery.js). Happy coding!

<script src="/assets/js/urlquery.js"></script>
