---
layout:   post
title:    "The Command Pattern in JavaScript"
date:     2016-04-25
---

The command pattern is technically simple. We have commands, which have an `execute()` function. We have invokers, which have an `invoke()` function.

```js
class ChangePrice {
  constructor(params) {
    this.currentDate = today(); // e.g. 2016-04-25
    this.effectiveDate = params.effectiveDate;
    this.newPrice = params.newPrice;
    this.oldPrice = null;
    this.productId = params.productId;
  }

  execute() {
    // Delete any existing future prices. A future price is effectiveDate > currentDate.
    // DELETE FROM price_history WHERE product_id = $1 and effective_date > $2;

    // Fetch the current price.
    // SELECT new_price FROM price_history
    //   WHERE product_id = $1 AND effective_date <= $2
    //   ORDER BY effective_date DESC LIMIT 1;

    // Insert a new record into the price history table.
    // INSERT price_history (product_id, effective_date, old_price, new_price)
    //   VALUES ($1, $2, $3, $4) RETURNING *;
  }
}
```

Invokers execute commands. Invokers carry a list of the commands that they have called.

A command can also be an invoker. This means that the command's `execute()` function is really just going to call the `invoke()` function.

The power of the command pattern is two features.

1. The list of commands should become an audit trail of what has happened in the application.
2. A command should have enough stored information to be reversible.
3. A command should be written in such a way that it can be replayed.

The first statement is one of fact. If you log the commands that happen and the data associated with the commands, I should be able to read a command history and see everything that has occurred in the application. What users did what, what the input values were, and what the outcome was.

When I create these logs, there should be enough data available to rollback the command. For example.

This command does not contain enough information to be reversible.

```js
{
  "command": "UpdateEmployee",  
  "id": 6352,
  "title": "Manager of Application Development"
}
```

While it is certainly enough information to create a SQL statement, it fails to meet the minimum qualification for reversibility.

This is a correctly formed command. There is enough information here that we could reverse it.

```js
{
  "command": "UpdateEmployee",
  "id", 6352,
  "updates": [
    {
      "field": "title",
      "from": "Developer",
      "to": "Manager of Application Development"
    }
  ]
}
```

### Commands for query operations are overkill

What does it mean to undo a query?
