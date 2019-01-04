---
layout:   post
title:    "Nested Arrays in EmberJS"
date:     2016-03-14
tags: emberjs
---

![EmberJS](http://www.gravatar.com/avatar/0cf15665a9146ba852bf042b0652780a?s=200){: .align-right } My latest project has me working on [EmberJS](http://emberjs.com/).

*Because at this point, what's one more JavaScript client framework?* In all seriousness, though, this has the benefit that I get to see lots of different technologies. It also has the downside that I do not get to work with a single technology long enough to get really good at it.

Our current problem is something along this line. We have a nested array of strings to hold the street address. We kicked around a few different solutions, but ended up with the most dynamic possible answer. It was also the trickiest solution, but that tends to be expected.

Here's a quick-and-dirty version of the model.

```js
App.ShippingAddress = DS.Model.extend({
  name: DS.attr('string'),
  address: DS.attr({
    defaultValue: function () {
      return [];
    }
  })
});
```

Instead of having separate fields for the different `address` parts, it is stored as a single array of strings in the database.

This problem here is that an array of strings is not bindable in Ember. Ember would much rather work with objects. To fix this, we added a computed property to the `ShippingAddress`. This function converts each `line` string into an simple `{value: <line>}` object.

```js
App.ShippingAddress = DS.Model.extend({
  name: DS.attr('string'),
  address: DS.attr({
    defaultValue: function () {
      return [];
    }
  }),

  editableAddress: Ember.computed('address', function () {
    var address = this.get('address');
    return address.map(function (line) {
      return { value: line };
    });
  })
});
```

In our template, we now work with `model.editableAddress`, instead of the original `address` property.

```html
<ul>
  {{"{{#each model.editableAddress as |line index|"}}}}
    <li>
      {{"{{input value=line.value"}}}}
      <span {{"{{action 'removeLine' index"}}}} style="cursor: pointer;">[-]</span>
    </li>
  {{"{{/each"}}}}
  <li>
    <span {{"{{action 'addLine'"}}}} style="cursor: pointer;">[+]</span>
  </li>
</ul>
```

When `addLine` and `removeLine` are used, their code will look like this. Note that we are adding a new object to the `editableAddress`.

```js
addLine() {
  var editableAddress = this.get('model.editableAddress');
  editableAddress.pushObject({ value: '' });
},
removeLine(index) {
  var editableAddress = this.get('model.editableAddress');
  editableAddress.removeAt(index);
},
```

The only step remaining is to set the new value of `address` based on what is currently stored in `editableAddress`.

```js
function updateShippingAddress() {
  var editableAddress = this.get('model.editableAddress');
  var address = [];
  editableAddress.forEach(function (line) {
    if (line.value && line.value.trim().length) {
      address.push(line.value.trim());
    }
  });
  this.get('model').set('address', address);
}
```

Check out the [working demo](https://embed.plnkr.co/HrSBPgzqq0ncOf0J9BLt/).

## Notes

Special thanks to [John Daley](http://johndaley.me/) and [Chad Moore](http://chadamoore.com/) for their insights on this bug.
