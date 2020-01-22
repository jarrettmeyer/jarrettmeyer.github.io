---
layout: post
title: "The Strategy Pattern in Node"
date: 2016-04-28
description:
thumbnail: /assets/images/javascript-logo.svg
---

The strategy pattern is a very useful way to have multiple concurrent solutions to a problem. Given some condition, we need to pick how we solve it.

In the simplest form, an `if/else` construct can do this for us.

```js
if (someCondition) {
    doFirstOption();
} else {
    doSecondOption();
}
```

The problem with the `if/else` scenario is that it doesn't scale. As our systems grow, we need a better way to inject new policies. We may have different strategies required for development, automated testing, and production environments. This is where the strategy pattern becomes so effective.

### The business logic

In our application, we have different login policies.

-   When running on localhost, passwords will be stored in the database.
-   When running under an automated test, the password is always "test".
-   When running in production, use active directory validate users.

### Strategy contract

If we were writing this solution in a static language, we would write an interface. It would look something like this.

```csharp
public interface ILoginStrategy
{
  bool UseStrategy();
  LoginResult Login(string username, string clearPassword);
}
```

We don't have the advantage of static interfaces in JavaScript. But the idea is the same. Instead of static type checking, we must rely on our own discipline.

Our strategies will look something like this. Instead of returning a `LoginResult`, as in our C# example, we will return a promise.

```js
class MyLoginStrategy {
    login(username, password) {
        return new Promise(resolve => {
            doSomeWork();
            return resolve({ strategy: "my strategy", success: true });
        });
    }

    useStrategy() {
        return testSomeCondition === true;
    }
}
```

### Registering strategies

Order matters when registering our strategies! Since we are looking at different values for which strategy to select, we could end up with multiple valid strategies. The test strategy is going to check the `NODE_ENV` environment variable. Our other strategies are going to check the `LOGIN_METHOD` environment variable.

```js
module.exports = {
    testLoginStrategy: require("./testLoginStrategy"),
    activeDirectoryLoginStrategy: require("./activeDirectoryLoginStrategy"),
    databaseLoginStrategy: require("./databaseLoginStrategy"),
    defaultLoginStrategy: require("./defaultLoginStrategy")
};
```

The strategies themselves are rather unimportant. The sample code is [available on GitHub](https://github.com/jarrettmeyer/node-strategy-pattern) if you'd like to see how they work.

### Selecting a strategy

Selecting a strategy is a rather simple task. We loop through all registered strategies, stopping when we find a valid strategy.

```js
const loginStrategies = require("./loginStrategies");

function selectLoginStrategy() {
    let strategies = Object.keys(loginStrategies);
    for (let i = 0; i < strategies.length; i++) {
        let strategy = loginStrategies[strategies[i]];
        if (strategy.useStrategy()) {
            return strategy.login;
        }
    }
}
```

To consume a strategy, we can simply do the following.

```js
function login(username, clearPassword) {
    let loginStrategy = selectLoginStrategy();
    return loginStrategy(username, clearPassword);
}
```

### Why have a default strategy?

We either need to have a default strategy, or we need to handle the condition when no strategy is found. It's not really important which you choose, but you must pick one option or the other.

The default strategy would look something like this. The default strategy `login()` always fails, and the `useStrategy()` always succeeds.

```js
class DefaultLoginStrategy {
    login(username, password) {
        return Promise.resolve({ strategy: "default", success: false, username: username });
    }

    useStrategy() {
        return true;
    }
}
```

We could also, just as easily, make the default strategy reject with an error, instead of resolve with `success: false`. These kinds of trivial decisions may be left up to the developer.

Sample code is [available on GitHub](https://github.com/jarrettmeyer/node-strategy-pattern).
