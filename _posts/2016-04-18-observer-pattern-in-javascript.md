---
layout:   post
title:    "The Observer Pattern in JavaScript"
date:     2016-04-18
---

The [observer pattern](https://en.wikipedia.org/wiki/Observer_pattern) is a simple way to allow communication between elements without having to rely on events, callbacks, or polling. The best thing about the observer pattern is that the thing being observed does not have to worry about what is observing it or how many observers it has.

Let's start with a simple `Counter` example. It will hold the current count and give us a function to increment the count.

```js
function Counter() {
  this.count = 0;
}

Counter.prototype.increment = function (amount) {
  this.count += amount || 1;
};
```

That's not very interesting. How would we communicate to other parts of our application that the count has changed? The usual solution in JavaScript is to use events. But we all are well aware that events get messy when an application gets sufficiently large.

This is where observers come in. Let's turn our `Counter` into an observable object. We need a collection of observers, a way to add observers to a `Counter`, and a way to notify the observers.

```js
function Counter() {
  this.count = 0;
  this.observers = [];
}

Counter.prototype.increment = function (amount) {
  this.count += amount || 1;
  this.notify({ count: this.count });
};

Counter.prototype.addObserver = function (observer) {
  this.observers.push(observer);
};

Counter.prototype.notify = function (data) {
  this.observers.forEach(function (observer) {
    observer.call(null, data);  
  });
};
```

How do we make use of this observable `Counter`?

```js
// Create a new instance.
var counter = new Counter();

// Add an observer to the instance.
counter.addObserver(function () {
  $("#myOutput").html(counter.count);
});

// Do something in the application that would call increment.
// Increment, in turn, will call notify, which will call all
// observers.
$("#myButton").on("click", function () {
  counter.increment();
});
```

Check out the [sample JSBin](http://output.jsbin.com/yikotu) to see it all working together.

Pretty simple, right? So let's make it less simple.

### Observers in Angular

In Angular, it is common to have services and controllers that need to communicate information to each other. We are going to create an example of two different controllers that show and hide different information based on the state of a shared object. [A demo is available](http://output.jsbin.com/nogices).

Let's start with a `CurrentUser`. Lots of completely separate parts of the application depend on who the current user is and what permissions the current user has. This means that the current user needs to be observable by various services and controllers. Importantly, our `login()` and `logout()` functions need to call `notify()`. This is what will trigger observers that something has changed.

```js
function CurrentUser() {
  this.username = null;
  this.isAuthenticated = false;
  this.observers = [];
}

CurrentUser.prototype.login = function (data) {
  this.username = data.username;
  this.isAuthenticated = true;
  this.notify(this);
};

CurrentUser.prototype.logout = function () {
  this.username = null;
  this.isAuthenticated = false;
  this.notify(this);
};

CurrentUser.prototype.notify = function (data) {
  this.observers.forEach(function (observer) {
    observer.call(null, data);
  });
};

CurrentUser.prototype.addObserver = function (observer) {
  this.observers.push(observer);
};
```

Let's start with something simple, like navigation. We will create a navigation controller, injecting the `CurrentUser` service. The `NavigationController` will observe the `CurrentUser`, monitoring for changes. Our constructor will add an observer to the `CurrentUser` instance.

```js
function NavigationController(currentUser) {
  this.currentUser = currentUser;
  this.username = null;
  this.isAuthenticated = false;
  this.currentUser.addObserver(this.onCurrentUserChanged.bind(this));
}

NavigationController.prototype.logout = function () {
  this.currentUser.logout();
};

NavigationController.prototype.onCurrentUserChanged = function () {
  this.username = this.currentUser.username;
  this.isAuthenticated = this.currentUser.isAuthenticated;
};
```

Of course, we could make this far more complicated -- and in my experience, it usually is -- by showing/hiding various menu options based on the roles and permissions of the current user. That has been left as an exercise for the reader.

Let's add a way for users to login. Our `LoginController` will control a simple form.

```js
function LoginController(currentUser) {
  this.currentUser = currentUser;
  this.showForm = true;
  this.username = "";
  this.currentUser.addObserver(this.onCurrentUserChanged.bind(this));
}

LoginController.prototype.login = function () {
  var username = this.username;
  if (username) {
    this.username = "";
    this.currentUser.login({ username: username });
  }
};

LoginController.prototype.onCurrentUserChanged = function () {
  this.showForm = !this.currentUser.isAuthenticated;
};
```

In [the demo project](http://output.jsbin.com/nogices), you'll notice that all of this works wonderfully without having to use any events or ever having to call `$apply()` to force updates.

### What about promises?

Another benefit of this solution is that it is "promise-proof". In Angular, there are times when things don't update when they should because you are waiting on promises to resolve. Suppose our `login()` function is a service. *It probably will be, since we can most-likely expect and API call.*

If you rely on events to propagate information, you're probably also going to have to have to call `$apply()` to force updates. While there is probably a good use for `$apply()`, I have yet to find a situation where `$apply()` couldn't be removed by having more discipline in your software.

```js
LoginController.prototype.login = function () {
  var _this = this;
  var username = this.username;
  if (username) {
    _this.username = "";
    return this.$q(function (resolve) {
      _this.currentUser.login({ username: username });
      return resolve(_this.currentUser);
    });
  }
};
```

You'll notice [in the demo](http://output.jsbin.com/nogices) that everything still works exactly as expected, even though the `currentUser` object is being modified within the context of a promise.
