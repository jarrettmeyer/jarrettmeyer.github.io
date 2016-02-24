---
layout:   post
title:    "Down with the Bloody Repository!"
date:     2016-02-25
---

In case you haven't heard, it's 2016. It's time for developers to start acting like it. If you're still writing mid-2000 style C# and Java, please read this PSA.

I am currently working on a 2-year old NodeJS project that, I kid you not, uses the repository pattern. Not only that, it uses it quite badly. While I agree with the concept that all of the business logic should be in the application core, this is not what is meant by that statement.

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

I can dream, right?
