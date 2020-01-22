---
layout: post
title: "JavaScript Getters, Setters, and Aliases with Object Prototypes"
date: 2015-01-06
description:
thumbnail: /assets/images/javascript-logo.svg
---

Happy 2015, everyone!

I'm neck deep in a pile of JavaScript, and I am trying to create aliases. As it turns out, this is relatively easy to accomplish.

Let's look at a sample class.

```javascript
var MyClass = (function() {
    function MyClass(initialValue) {
        this.value = +initialValue || 0;
    }
})();
```

Creating an instance and getting/setting `value` is quite simple. We can create a new instance of `MyClass` and simply access the value.

```javascript
var instance = new MyClass();
instance.value = 3;
console.log("value = " + instance.value); // value = 3
```

My problem was that I needed to create an alias. It turns out, this is pretty easy to do an object with `Object.defineProperty()`. I simply give it an object, the name of the getter/setter, and the appropriate functions.

```javascript
Object.defineProperty(instance, "alias", {
    get: function() {
        return this.value;
    },
    set: function(x) {
        this.value = x;
    }
});
```

I can now create change `value` and read `alias`.

```javascript
instance.value = 4;
console.log("value = " + instance.alias); // value = 4
```

What if we wanted all instances of `MyClass` to share this alias? That takes just one small trick: instead of using `instance`, simply use `MyClass.prototype`. Applying the new property to the prototype means that all instances of that class will be created with the new getter and setter.

```javascript
var MyClass = (function() {
    function MyClass(initialValue) {
        this.value = +initialValue || 0;
    }

    Object.defineProperty(MyClass.prototype, "alias", {
        get: getAlias,
        set: setAlias
    });

    return MyClass;

    function getAlias() {
        return this.value;
    }

    function setAlias(x) {
        this.value = x;
    }
})();
```

Now, every new instance of `MyClass` will have both the `value` and `alias` properties.

```javascript
var instance = new MyClass(5);
console.log(instance.value); // 5
instance.alias += 2;
console.log(instance.value); // 7
instance.value += 3;
console.log(instance.alias); // 10
```
