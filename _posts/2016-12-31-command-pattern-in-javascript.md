---
layout:   post
title:    "The Command Pattern in JavaScript"
date:     2016-12-31
---

It appears that I've started a series on design patterns in JavaScript.

* [Observer Pattern](/2016/04/18/observer-pattern-in-javascript)
* [Mediator Pattern](/2016/04/21/mediator-pattern-in-javascript)

I am continuing this series with the [command pattern](https://en.wikipedia.org/wiki/Command_pattern). The command pattern's goal is to separate domain objects from the actions taken on behalf of those domain objects.

Let's work with an online store. While certainly not Amazon, this online store is maturing with the data it is tracking. As the tracked data matures, the software needs to mature.

Let's start with a core `Product` object. (While it could be much larger, this is more than sufficient.) This is our domain object, not our data representation, and not our presenter.

```js
class Product {
  constructor(params) {
    this.categoryTree = params.categoryTree;
    this.currentDiscounts = params.currentDiscounts;
    this.currentPrice = params.currentPrice;
    this.description = params.description;
    this.id = params.id;
    this.name = params.name;
    this.options = params.options;
    this.status = params.status;
    this.tags = params.tags;
    this.vendor = params.vendor;
  }
}
```

Without knowing too much about the rest of the database, we can start to see the sophistication in this application.

1. Products belong to a single category, and this category is part of a tree. A tie would fall under the category.

    *Clothing > Men > Accessories > Neckties*

    This must mean that whatever is hydrating this object is doing the work of building
2. We have both `currentDiscounts` and `currentPrice`. This (hopefully) means that there is something along the lines of non-current discounts and non-current price.
3. The `tags` properties is plural. We should assume this is an array.
4. Vendor is a relationship, and not just an `id`. Again, whatever is hydrating this object must be doing that work for us.

If we were young programmers, we would probably do something like this.

```js
class ProductDataService {
  create(params);
  destroy(params);
  findById(params);
  search(params);
  update(params);
}
```

It's a simple CRUD layer. What more do we need, right?

We **need** to have better separation of concerns. This class does too much. Updating a product is an enormous undertaking. There are so many different things that can change, and many of them have to be handled in different ways. Having searching and updating in the same class is clear violation of separation of concerns.

This is where commands can help us.

```js
class CreateProduct {
  execute();
}

class DestroyProduct {
  execute();
}

class UpdateProduct {
  execute();
}
```

Like the mediator pattern, we can begin to see a self-documenting directory structure.

```
app/
  services/
    commands/
      CreateProduct.js
      DestroyProduct.js
      UpdateProduct.js
    queries/
      FindProductById.js
      SearchProducts.js
```

*Commands are write operations. Queries are read operations. Typically, these distinct types of operations will be separated in your code base.*

### More mature data

Let's look at something like changing a price. In your first ever inventory database, you'll probably write something like this.

| id | name        | description                             | price  |
| -- | ----------- | --------------------------------------- | -----: |
|  1 | My Shiny    | This is a very neat thing that we sell. |   3.88 |
|  2 | My Precious | It is precious to us.                   | 209.79 |

However, this approach does not stand the test of time. Prices need to be stored in their own price history table. Prices change (frequently!) and I have never encountered a system where that was not incredibly important. Not only do prices change, but they change at planned times, so we need to know when the price change takes effect.

| id  | product_id | effective_date | price | active |
| --- | ---------- | -------------- | ----: | :----: |
| 208 | 3296       | 2016-02-18     | 13.29 | TRUE   |
| 209 | 1073       | 2016-03-14     | 1.98  | TRUE   |
| 210 | 6823       | 2016-01-02     | 26.46 | TRUE   |
| 211 | 6261       | 2015-11-30     | 7.55  | TRUE   |

Instead of being a single column, the current price is a query. We want the price for the product with the newest effective date.

```sql
SELECT * FROM price_history
WHERE effective_date <= $1 AND product_id = $2 AND active = TRUE
ORDER BY effective_date DESC
LIMIT 1;
```

We purposely make effective data a query parameter. Why? If we always check `effective_date <= today()`, that tells us the price for today. What if we want to know what the price was on June 30, 2014? Now we have that information easily available.

Updating a price is no longer a simple CRUD operation. It's a series of commands. When a price changes, multiple records in a database need to be updated and inserted.

1. Remove any existing future prices.
2. Insert a new row into the table.
3. Update existing shopping carts with the new price.

Ever notice how Amazon gives you this message?

![Shopping cart changed price](/assets/images/shopping-cart-changed-price.png){: .align-center }

This is where the command pattern comes in. We can wrap these commands in a single object: an invoker. We encapsulate a single business rule into a command.

### What does it mean for something to be a command?

Commands are so much more than write objects with an `execute()` function. Finally, let's define a command structure.

1. **Isolation**: A command is an object with a parameterless `execute()` function. All necessary parameters are properties on the object. Importantly, the command should do one thing, with the expectation that a single invoker may execute multiple commands.
2. **Durable**: Invokers should keep track of the commands they call and the parameters that were used. This means that all commands should be durably logged.
3. **Repeatability**: Commands should contain enough information that they can be repeated.
4. **Reversibility**: Commands should contain enough information that they can be rolled back.

In our application, what does it mean to update a price? It means that `UpdatePrice` is an invoker - it calls a sequence of commands.

```js
class UpdatePrice {
  invoke(params) {
    // Since this is JavaScript, we can assume that all of these execute functions
    // would be callbacks or promises.
    return executeCommand(new RemoveFuturePrices({ productId: params.id }))()
      .then(executeCommand(new InsertFuturePrice({ productId: params.id, price: params.price })))
      .then(executeCommand(new UpdateShoppingCartPrices({ productId: params.id, price: params.price })));
  }
}
```

Roughly, our `executeCommand()` function would look something like this. I write commands so that they can be chained by design. By making all commands return a promise, we can be smart about how we write an executor.

```js
function executeCommand(command) {
  return (results) => {
    results = results || [];
    return command.execute()
      .then(latestResult => {
        results.push(latestResult);
        // TODO: logCommand is left as an exercise for the reader.
        return logCommand(command, latestResult);
      })
      .then(() => {
        return results;
      });
  };
}

module.exports = executeCommand;
```

**As our applications mature, the data we capture needs to become more mature.** The business rules become more complex. The interconnectedness of our domain objects become more complex. In turn, we -- as responsible developers -- need to do everything we can to combat this complexity.

### Removing Future Prices

A price is a combination of a price and the date that price becomes effective. We can already imagine the SQL statement that arises from this command.

```sql
DELETE FROM price_history WHERE product_id = $1 AND effective_date > today();
```

We should already see some red flags with this approach. If we delete a record, how do we undelete a record? We would either require an audit trigger on the table, or we would require an active/inactive flag. Let's choose the latter.

```sql
UPDATE price_history SET active = FALSE WHERE product_id = $1 and effective_date >= today();
```

We have solved one problem, but we still have another. We have a different command result on Tuesday than we would have if we ran the same command on Monday. We need to not rely on the server's date. Instead, the effective date also needs to be a parameter to our query.

```sql
UPDATE price_history SET active = FALSE WHERE product_id = $1 and effective_date >= $2;
```

Our command should now easily be able to store enough information.

```js
class RemoveFuturePrices {
  constructor(params) {
    this.commandName = 'RemoveFuturePrices';
    this.productId = params.productId;
    this.date = new Date();
  }
  execute() {
    return executeQuery(sql, this.productId, this.date);
  }
}
```

When the command gets logged, we should see something like this.

```json
{
  "command": "RemoveFuturePrices",
  "date": "2016-04-25",
  "productId": 6352
}
```

We can repeat this command. We can rollback this command.
