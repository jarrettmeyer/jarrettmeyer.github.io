---
layout:   post
title:    "Making Promises Suck a Little Less"
date:     2016-05-12
---

Asynchronicity is both the blessing and curse of JavaScript. The same feature that provides speed also creates some really ugly code.

If you have any familiarity with Promises, you will have seen code that looks like this. It's not pretty, but it's just what happens. We're probably all guilty of writing junk that looks like this.

```js
function getUserDetails(id) {
  let user = null;
  return cache.get(`users/${id}`)
    .then(cacheHit => {
      if (cacheHit) {
        return cacheHit;
      }
      else {
        return db.users.findOne({ id: id })
          .then(_user => {
            user = _user;
            return db.userProperties.findAll({ userId: id });
          })
          .then(userProperties => {
            user.properties = userProperties;
            return db.permissions.findAll({ userId: id });
          })
          .then(permissions => {
            user.permissions = permissions;
            return cache.set(`users/${id}`, user)
              .then(() => {
                return user;
              });
          });
      }
    });
}
```

Instead of writing code like this, I encourage you to start writing your code to be "Promise-chain aware". Yes, this is more code, but look how much it cleans up the promise chain. Additionally, logging the result object give you a much clearer picture of everything that happened during the event.

The general form of this pattern is the following. For each internal function, the input and the output are the same object. We continue to add more properties to the object as it passes through the promise chain.

```js
function myPublicFunction(params) {
  return myFirstInternalFunction(obj)
    .then(mySecondInternalFunction)
    .then(myThirdInternalFunction)
    .then(myFourthInternalFunction);
}
```

To go back to our previous example, the code should look like this.

```js
function getUserFromCache(e) {
  e.cacheKey = `users/${e.id}`;
  return cache.get(e.cacheKey)
    .then(cacheHit => {
      if (cacheHit) {
        e.user = cacheHit;
        e.hasCacheHit = true;
      }
      else {
        e.hasCacheHit = false;
      }
      return e;
    });
}

function getUserFromDatabase(e) {
  // We already have a user from cache.
  if (e.user) {
    return e;
  }
  return db.users.findOne({ id: e.id })
    .then(user => {
      e.user = user;
      return e;
    });
}

function getUserPermissionsFromDatabase(e) {
  // We already have user permissions.
  if (e.user.permissions) {
    return e;
  }
  return db.permissions.findAll({ userId: e.id })
    .then(permissions => {
      e.user.permissions = permissions;
      return e;
    });
}

function getUserPropertiesFromDatabase(e) {
  // We already have user properties.
  if (e.user.properties) {
    return e;
  }
  return db.userProperties.findAll({ userId: e.id })
    .then(properties => {
      e.user.properties = properties;
      return e;
    });
}

function saveUserToCache(e) {
  // If we had a cache hit from before, don't save to catch again.
  if (e.hasCacheHit) {
    return e;
  }
  return cache.set(e.cacheKey, e.user)
    .then(() => {
      return e;
    });
}

// Our public function now looks much simpler.
function getUserDetails(id) {
  return getUserFromCache({ id: id })
    .then(getUserFromDatabase)
    .then(getUserPropertiesFromDatabase)
    .then(getUserPermissionsFromDatabase)
    .then(saveUserToCache)
}
```

By the end of the promise chain, the result object should be a record of everything that happened.

```json
{
  "cacheKey": "users/123",
  "hasCacheHit": false,
  "id": 123,
  "user": {
    "email": "john.doe@example.com",
    "hashedPassword": "e5e9fa1ba31ecd1ae84f75caaa474f3a663f05f4",
    "id": 123,
    "permissions": [
      { "userId": 123, "value": "assign_task" },
      { "userId": 123, "value": "close_task" },
      { "userId": 123, "value": "create_task" },
      { "userId": 123, "value": "edit_task" }
    ],
    "properties": [
      { "userId": 123, "key": "display_name", "value": "John D." },
      { "userId": 123, "key": "first_name", "value": "John" },
      { "userId": 123, "key": "last_name", "value": "Doe" }
    ]
  }
}
```

Like I said earlier, this is more code to write, but I promise you it's worth it. *Pun intended.*
