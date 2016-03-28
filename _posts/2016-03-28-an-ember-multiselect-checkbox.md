---
layout:   post
title:    "An Ember Multi-select Checkbox"
date:     2016-03-28
---

Last week, I needed to create a series of multi-select checkboxes for a project that I'm working on. The client side framework is [EmberJS](http://emberjs.com/). There were a few open-source options out there. Unfortunately, they use the existing [Ember-CLI](http://ember-cli.com/). Our project, being a bit older and out of date, cannot use Ember CLI.

But, rolling your own isn't so difficult. Let's start with what we're trying to accomplish. We want to turn a list of checked items into an array of strings.

![Multi-select checkboxes](/assets/images/multiselect-checkboxes.png)

```javascript
// Our model has a property called "permissions". This property is an
// array of strings.
App.IndexRoute = Ember.Router.extend({
  model: function () {
    return {
      /* snip */
      permissions: []
      /* snip */
    };
  }
});

// Our controller has an array of available options. As usual, the `label`
// is displayed on screen. The `value` is the string that is stored on the
// model.
App.IndexController = Ember.Controller.extend({
  adminOptions: [{
    label: 'Can create users?',
    value: 'create_users'
  }, {
    label: 'Can disable users?',
    value: 'disable_users'
  }, {
    label: 'Can edit users?',
    value: 'edit_users'
  }],
  // This is used to display the selected permissions in the UI. It is
  // not required as part of the solution.
  selectedAsString: Ember.computed('model.permissions.[]', function () {
    return JSON.stringify(this.get('model.permissions'));
  })
});
```

Our component is written in two parts. The first part is the checkbox element itself. The second is the actual component.

```javascript
// Each available option becomes an instance of a "MultiSelectCheckbox" object.
var MultiSelectCheckbox = Ember.Object.extend({
  label: 'label',
  value: 'value',
  isChecked: false,
  changeValue: function () { },
  onIsCheckedChanged: Ember.observer('isChecked', function () {
    var fn = (this.get('isChecked') === true) ? 'pushObject' : 'removeObject';
    this.get('changeValue').call(this, fn, this.get('value'));
  })
});

App.MultiSelectCheckboxesComponent = Ember.Component.extend({
  labelProperty: 'label',
  valueProperty: 'value',
  // The list of available options.
  options: [],
  // The collection of selected options. This should be a property on
  // a model. It should be a simple array of strings.
  selected: [],
  checkboxes: Ember.computed('options', function () {
    var _this = this;
    var labelProperty = this.get('labelProperty');
    var valueProperty = this.get('valueProperty');
    var selected = this.get('selected');
    return this.get('options').map(function (opt) {
      var label = opt[labelProperty];
      var value = opt[valueProperty];
      var isChecked = selected.contains(value);
      return MultiSelectCheckbox.create({
        label: label,
        value: value,
        isChecked: isChecked,
        changeValue: function (fn, value) {
          _this.get('selected')[fn](value);
        }
      });
    });
  })
});
```

Here is our (very simple) component template.

```html
{{"{{#each checkboxes as |checkbox|"}}}}
  <p>
    <label>
      {{"{{input type='checkbox' checked=checkbox.isChecked"}}}}
      {{"{{checkbox.label"}}}}
    </label>
  </p>
{{"{{/each"}}}}
```

Finally, to make use of our component, write the following in your template.

```html
{{"{{multi-select-checkboxes options=adminOptions selected=model.permissions"}}}}
```

That's really all it takes. A fully working example of this code is available at [JSBin](http://output.jsbin.com/zedoxib).
