---
layout: post
title: "Reliable Database Fixtures with CouchDB"
date: 2015-02-23 07:35:18 -0500
comments: true
categories: ["code", "couchdb", "javascript", "nodejs"]
thumbnail: /assets/images/database.svg
---

My latest project has me working with Apache's [CouchDB](http://couchdb.apache.org). We needed to solve the problem of how to create a working application when we have a dozen developers working around the globe. While CouchDB has no schema to worry about, we do require [design documents](http://docs.couchdb.org/en/1.6.1/couchapp/ddocs.html) to produce queries.

These design documents are code, and the map-reduce functions are JavaScript. Like anything that is code, they need to be tracked, versioned, and part of the source. We have made each document it's own file. Each of these documents is stored in a `documents` folder.

```javascript
// _design_all.js
module.exports = {
    _id: "_design/all",
    language: "javascript",
    views: {
        byType: {
            map: function(doc) {
                emit(doc.type, null);
            }
        }
    }
};

// product_1000.js
module.exports = {
    _id: "product_1000",
    type: "Product",
    description: "This is my super-cool product. You should definitely buy it!",
    timestamp: new Date().toISOString()
};
```

There are a few catches to this setup. The biggest being that we need deterministic identifiers. We do have documents that relate to each other, and this only works well when we know the `_id` values of those documents.

To insert these documents, we use the Node library [Cradle](https://github.com/flatiron/cradle).

```javascript
var cradle = require("cradle");
var fs = require("fs");
var path = require("path");

var couchFiles = [];
var db = new cradle.Connection({
    host: "http://localhost",
    port: 5984,
    cache: false
}).database("my_database");
var folder = "./documents";

console.log("Inserting CouchDB documents...");
fs.readdir(folder, function(error, files) {
    if (error) {
        console.error(error);
        return process.exit(1);
    }
    couchFiles = couchFiles.concat(mapFiles(files));
    processNextCouchFile();
});

function getNextFile() {
    var nextFile = couchFiles.shift();
    if (!nextFile) {
        console.log("Done inserting CouchDB documents.");
        return process.exit(0);
    }
    return nextFile;
}

function mapFiles(files) {
    return files
        .filter(function(file) {
            return path.extname(file).toLowerCase() === ".js";
        })
        .map(function(file) {
            return path.join(__dirname, folder, file);
        });
}

function processNextCouchFile() {
    var nextFile = getNextFile();
    console.log("    Working with file: ", nextFile);
    var doc = require(nextFile);
    db.save(doc, function(error, result) {
        if (error) {
            console.error(error);
            return process.exit(1);
        }
        console.log("        Saved document:", result.id);
        processNextCouchFile();
    });
}
```

Before we run our integration tests, we wipe out the database, recreate the database, and run this script. Our tests can run against localhost, with hundreds of predefined documents, testing each of our views in a fraction of a second.

It's CouchDB. Relax!
