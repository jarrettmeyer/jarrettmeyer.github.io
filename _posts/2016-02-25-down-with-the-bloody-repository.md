---
layout:   post
title:    "Down with the Bloody Repository!"
date:     2016-02-25
---

I am currently working on a 2-year old NodeJS project that, I kid you not, uses the repository pattern. Not only that, it uses it quite badly. While I agree with the concept that all of the business logic should be in the application core, this is not what is meant by that statement.

Martin Fowler has documented the [repository pattern](http://martinfowler.com/eaaCatalog/repository.html) quite well.

> Mediates between the domain and data mapping layers using a collection-like interface for accessing domain objects.

Instead of working with a database, you work with a collection. You track which objects are modified in, what gets added to, and what gets removed from this collection. After some amount of work is completed, that collection is synced back to the database.

**That** is the by-the-book definition of a repository. As many years as I have been doing this, as many projects that I have worked on, I have never once in my life seen anything even closely resembling a repository.

Instead, though the languages may change, I continue to see work like the following.

```js
// DocumentRepository.js
module.exports = {
  findAll: findAll,
  findById: findById,
  insert: insert,
  remove: remove,
  restore: restore,
  publish: publish,
  unpublish: unpublish,
  update: update
};

function findAll() {
  // snip
}

function findById(id) {
  // snip
}

// The rest has been trimmed.
```

We end up with a single file about 600 lines long, once all of the functionality, validation, and private functions are written. This is a single object that does 8 things! Why?

Oh! And it's called a repository, but it isn't. It's a data access façade.

> A façade is an object that provides a simplified access to a larger body of code. A façade can make a software library easier to use, understand, and test, since the façade has convenient methods for common tasks.

It's not that I totally hate the idea of the repository pattern. It's that what gets taught and demonstrated as the repository pattern isn't the repository pattern. I like my name. But if you call be Bob, I'm not going to respond to you the way you'd like.

If it really were a repository, it would need to look something more like this.

```js
module.exports = {
  add: function (document) {
    // Add a new document to the collection. This does not send the document to
    // the database until sync() is called.
  },
  remove: function (document) {
    // Remove a document from the collection. This does not remove the  document
    // from the database until sync() is called.
    //
    // Also handle edge cases, like removing a document that was added but never
    // synced.
  },
  sync: function () {
    // Synchronize the in-memory collection with the database. This includes all
    // of the adds, removes, and tracked changes for all items in the collection.
  }
}
```

What about all of that other functionality? Fowler again tells about the noun-verb method of writing classes. A document should have a `publish()` function. What if that function is supposed to do other things, like [create activity log entries](/2016/02/24/capturing-database-metadata) or notify interested subscribers? Those should be handled as background processes. Side-effects should not be in the main line of code.

### Do one thing

If there is anything that NodeJS has helped me to reinforce, it is **do one thing**. Instead of one file, this should be at least 9, maybe more depending on how many shared utility functions need to be broken out.

```js
// findAllDocuments.js
module.exports = function () {
  // snip
}

// insertDocument.js
module.exports = function (document) {
  if (document._id || document.id) {
    throw new Error('Inserted document should not have an ID property.');
  }
  document.insertedAt = new Date();
  document.modifiedAt = new Date();
  return validateDocument(document)
    .then(saveDocument);
};

// validateDocument.js
module.exports = function (document) {
  // snip
};
```

Now imagine someone new coming into your application. Imagine the question, "What is everything your application does?"

```
app/
  services/
    bcryptComparePassword.js
    bcryptHashPassword.js
    findActivityLogById.js
    findAllActivityLogs.js
    findAllActivityLogsByDocument.js
    findAllDocuments.js
    findAllUsers.js
    findDocumentById.js
    findUserByEmail.js
    findUserById.js
    hashString.js
    insertActivityLog.js
    insertUser.js
    loginUser.js
    publishDocument.js
    purgeDocument.js
    purgeUser.js
    removeDocument.js
    removeUser.js
    restoreDocument.js
    restoreUser.js
    unpublishDocument.js
    updateDocument.js
    updateUser.js
    validateUser.js
    validateRequiredProperties.js
    validateDocument.js
```

I've never walked into a project that looked like that (except for ones that I've written).

OK, I admit that looks a little ugly, and this is just a small fraction of a single project. Let's group together functions with common functionality.

```
app/
  services/
    activityLogs/
      findActivityLogById.js
      findAllActivityLogs.js
      findAllActivityLogsByDocument.js
      insertActivityLog.js
    authentication/
      bcryptComparePassword.js
      bcryptHashPassword.js
      loginUser.js
    documents/
      findAllDocuments.js
      findDocumentById.js
      insertDocument.js
      publishDocument.js
      purgeDocument.js
      removeDocument.js
      restoreDocument.js
      unpublishDocument.js
      updateDocument.js
      validateDocument.js
    users/
      findAllUsers.js
      findUserByEmail.js
      findUserById.js
      insertUser.js
      purgeUser.js
      removeUser.js
      restoreUser.js
      updateUser.js
      validateUser.js
    util/
      hashString.js
      validateRequiredProperties.js
```

If we want something that looks like our old repository, we can do that, too, with `index.js` files. This looks quite similar, and it isn't a cluttered mess of public and private functions.

```js
var publishedDocuments = services.documents.findAllDocuments({ published: true });
```

### The challenge

Make your pieces small. No. Smaller. No. Smaller. Seriously, I shouldn't even have to scroll. I'm not joking. Build small pieces and compose them. There is no language where that has been easier than JavaScript on NodeJS.

I can dream, right?

### References

* Hieatt, Edward & Mee, Rob. Repository. Accessed February 24, 2016, from [http://martinfowler.com/eaaCatalog/repository.html](http://martinfowler.com/eaaCatalog/repository.html)

* Façade Pattern. Accessed February 25, 2016, from [https://en.wikipedia.org/wiki/Facade_pattern](https://en.wikipedia.org/wiki/Facade_pattern)
