---
layout:   post
title:    "The Mediator Pattern in JavaScript"
date:     2016-04-21
---

The [mediator pattern](https://en.wikipedia.org/wiki/Mediator_pattern) is a way to separate the concerns of *what code asks for something* vs. *what code does the thing*.

*Note: I have created [a working demo](http://output.jsbin.com/jejuhoh) of all the handlers and messages shown in this article.*

This is similar to the previously posted [observer pattern](/2016/04/18/observer-pattern-in-javascript), that it creates a separation of concerns. While observers work on the back end of a data change or modification, the mediator's responsibility is to create changes.

### Show me the code

A mediator is a very simple object. It holds a collection of handlers. When something needs to be done, we send a request to the mediator. We will loop through all of the available handlers until we find something that can handle the request. The caller does not care at all about what code handles the request or how that request is handled.

```js
function Mediator() {
  this.handlers = [];
}

Mediator.prototype.addHandler = function (handler) {
  this.handlers.push(handler);
};

Mediator.prototype.request = function (message) {
  for (var i = 0; i < this.handlers.length; i++) {
    var handler = this.handlers[i];
    if (handler.canHandle(message)) {
      return handler.handle(message);
    }
  }
  return null;
};
```

Each handler conforms to a very basic contract. Our request handlers need to have two functions: `canHandle()` and `handle()`. Both functions take a message object.

`canHandle(message)`: Returns true if the handler knows what to do with the given message. Messages can be distinguished by many possible features. Usually, the handler will inspect the message for various properties. I have also seen the mediator where every message has a `type` property. In this case, it is only necessary to inspect the type. This is certainly convenient, and it adds a bit of communication as to what is being done within the application.

`handle(message)`: Do whatever needs to happen to the message.

Let's look at a very simple handler.

```js
const sayHelloHandler = {
  canHandle: function (message) {
    return !!message.name;
  },
  handle: function (message) {
    return {
      name: message.name,
      say: 'Hello, ' + message.name + '!'
    };
  }
};
```

Let's show how we make use of a mediator.

```js
// Create a new instance of a mediator. The mediator should be a singleton within
// your application.
let mediator = new Mediator();
mediator.addHandler(someHandler);
mediator.addHandler(someOtherHandler);
mediator.addHandler(yetAnotherHandler);
// snip...
// Depending on the size of your handler, you may need to add dozens - maybe
// hundreds - of handlers.
```

Once the mediator is created and all of the handlers have been added, we simply make requests to the handler.

```js
var request = { name: 'Alice' };
var reply = mediator.request(request);
// => { name: 'Alice', say: 'Hello, Alice!' }
```

### More handlers vs. more complex handlers

Our `canHandle()` can certainly add more complexity. At this point, it becomes a matter of preference which you would rather see in your code base. For example, you can have just a single handler with conditions in the `handle()` function.

```js
const tempHandler = {
  canHandle: function (message) {
    return !!message.temp || message.temp === 0;
  },
  handle: function (message) {
    var reply = { temp: message.temp };
    if (message.temp < 60) {
      reply.message = 'It is too cold!';
    }
    else if (message.temp > 90) {
      reply.message = 'It is too hot!';
    }
    else {
      reply.message = 'It should be a pleasant day today!';
    }
    return reply;
  }
}
```

Or you can have a very simple `handle()` function with conditions in the `canHandle()` function. This, in turn, means we need multiple handlers.

```js
const tooColdHandler = {
  canHandle: function (message) {
    return message.temp < 60;
  },
  handle: function (message) {
    return {
      temp: message.temp,
      message: 'It is too cold!'
    };
  }
};

const tooHotHandler = {
  canHandle: function (message) {
    return 90 <= message.temp;
  },
  handle: function (message) {
    return {
      temp: message.temp,
      message: 'It is too hot!'
    };
  }
}

const niceDayHandler = {
  canHandle: function (message) {
    return 60 <= message.temp && message.temp < 90;
  },
  handle: function (message) {
    return {
      temp: message.temp,
      message: 'It should be a pleasant day today!'
    };
  }
};
```

Deciding which to use is up entirely to the developer. My preference is (almost always) to have more message handlers and to keep the `handle()` functions simple as possible. Your milage may vary.

### Handlers and data operations

Handlers encapsulate work into a single `handle()` function. Instead of having code that looks like this...

```js
class ProductDataService {
  create(params);
  destroy(params);
  findById(params);
  search(params);
  update(params);
}
```

... We instead create code that looks like this...

```js
class CreateProduct {
  handle(params);
}

class DestroyProduct {
  handle(params);
}

class FindProductById {
  handle(params);
}

class SearchProducts {
  handle(params);
}

class UpdateProduct {
  handle(params);
}
```

The same amount of "code work" has to get done no matter what. I assert that the second option makes for far more maintainable code over the long term. In fact, this opens the door to scenarios where the folder structure itself is documenting of everything the application does.

```
app/
  services/
    customers/
      ChangeAddress.js
      ChangePassword.js
      CreateCustomer.js
      FindCustomerByEmail.js
      FindCustomerById.js
      SendPasswordResetEmail.js
      UpdateCustomerProfile.js
    orders/
      CancelOrder.js
      CompleteOrder.js
      FindOrderById.js
      FindOrdersBy
      NotifyOnBackorder.js
      UpdateExpectedShipDate.js
    products/
      ChangePrice.js
      CreateProduct.js
      DestroyProduct.js
      FindProductById.js
      SearchProducts.js
      UpdateProduct.js
    security/
      Login.js
      Logout.js
    shoppingCart/
      AddToCart.js
      Checkout.js
      DestroyStaleCarts.js
      RemoveFromCart.js
      UpdateQuantity.js
    users/
      CreateUser.js
      FindAllUsers.js
      FindUserByEmail.js
      UpdateUser.js
```

Think about a new developer coming to this application. Think about the mapping that happens between the UI and the various handlers in the application. We can probably already envision our shopping cart screen, with Add, Remove, and Update Quantity buttons.

We can foresee the parts of the application that might require more effort than normal. For example, `ChangePrice` is separate from `UpdateProduct`. Why would that be the case? Perhaps changing the price of a product requires additional work to take place. It's more than just `UPDATE products SET description=$1 WHERE id=$2;`. First, prices should be kept in a price history table, where the current price is the latest entry in the table. Second, shopping carts need to be updated.

![Shopping Cart Changed Price](/assets/images/shopping-cart-changed-price.png){: .align-center }

Self-documenting code is the best code!

### Handlers returning promises

Can handlers return promises? Yes. The only thing required by the mediator pattern is that the caller knows how to work with the reply. The caller doesn't care who does the work how the work gets done. So, if the reply is a promise, then so be it, and the caller needs to know how to work with that.

```js
const promiseHandler = {
  canHandle: function (message) {
    return message.type === 'promise';
  },
  handle: function (message) {
    return new Promise(function (resolve) {
      var delay = message.delay || 1000;
      setTimeout(function () {
        return resolve({
          delay: delay,
          timestamp: Date.now()
        });
      }, delay);
    });
  }
};

var reply = mediator.request({ type: promise, delay: 5000 });
reply.then(function (result) {
  alert(JSON.stringify(result));
  // => { "delay": 3000, "timestamp": 1460985726449 }
});
```

### A final note

You will notice two important issues when working with the mediator pattern. First, the handlers are registered in order. Second, once a handler is found, the mediator's `request()` function immediately returns. I beg you, please do not exploit this.

```js
const tooColdHandler = {
  canHandle: function (message) {
    return message.temp < 60;
  },
  // snip
};

const niceDayHandle = {
  canHandle: function (message) {
    return message.temp < 90;
  },
  // snip
};

const tooHotHandler = {
  canHandle: function (message) {
    return message.temp;
  },
  // snip
};
```

As long as these three handlers are registered in order, everything will work exactly as expected. However, we should not rely on this behavior. Relying on order is an anti-pattern.
