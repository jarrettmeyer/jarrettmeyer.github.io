---
layout:   post
title:    "Managing MongoDB Data Migrations"
date:     2016-04-15
---

As a schemaless database, [MongoDB](https://www.mongodb.com/) is already quite forgiving when it comes to handling data. Frequently, changes can be made to a data model in code only, without having to rely on more complex data migrations. Still, there are times when you do want to be more explicit.

To run a Mongo script, simply call the script from the command line.

```
$ mongo ./migrations/path-to-my-script.js
```

### Adding an index to a collection

MongoDB supports indexing! In the example below, we are creating a unique index on our people table.

```js
var conn = new Mongo();
var db = conn.getDB('mydb');
var cursor = db.people.find();
db.people.createIndex({
  email: 1
}, {
  unique: true
});
print('Done creating index.');
```

### Adding a new property with a default value

We are adding support for soft deletes. In many languages `false` and `null` have the same truth value; however, this is not always the case. For updates, the first part is the `where` or `find` of the query. We want our migrations to be "safe", so we are going to make sure to not destroy any existing data. In this case, we will only select people who have no previously set value for `removed`.

```js
var conn = new Mongo();
var db = conn.getDB('mydb');
db.people.update({
  removed: null
}, {
  $set: {
    removed: false
  }
});
```

We are using Mongo's `$set` operator for the second argument. The `$set` operator will only modify the properties specified in the object. Without the `$set` operator, Mongo will assign the entire document equal to the parameter. You do not want to make this mistake...

```js
db.people.find({ _id: 1 });
{
  _id: 1,
  firstName: 'Jane',
  lastName: 'Doe',
  email: 'jane.doe@example.com',
  dob: '1991-06-15'
}

db.people.update({ _id: 1 }, { removed: false });
db.people.find({ _id: 1 });
{
  _id: 1,
  removed: false
}
```

This is why the `$set` operator is necessary.

```js
db.people.find({ _id: 1 });
{
  _id: 1,
  firstName: 'Jane',
  lastName: 'Doe',
  email: 'jane.doe@example.com',
  dob: '1991-06-15'
}

db.people.update({ _id: 1 }, { $set: { removed: false } });
db.people.find({ _id: 1 });
{
  _id: 1,
  firstName: 'Jane',
  lastName: 'Doe',
  email: 'jane.doe@example.com',
  dob: '1991-06-15',
  removed: false
}
```

### Renaming or modifying a property

Renaming a property is a combination of adding a new property and removing an old one. Again, we are going to be careful with our data, always being sure to not destroy anything that might already exist.

Suppose our person object has an `employer` property. After some time, we wish to turn this into an `employers` array. The employer nested object is a `name`, `location`, `startDate`, and `endDate`.

```js
var people = db.people.find();
people.forEach(function (person) {
  var id = person._id;

  // If the person already has employers, leave it alone.
  var employers = person.employers;

  // If the person has an employer object, turn it into an array.
  if (!employers && person.employer) {
    employers = [].concat(person.employer);
  }

  // If employers is still not set, create a default stub.
  if (!employers) {
    employers = [{ name: null, location: null, startDate: null, endDate: null }]
  }

  // Update the person record.
  db.people.update({
    _id: id
  }, {
    $set: {
      employers: employers
    },
    $unset: {
      employer: true
    }
  });
});
```

### Putting it all together

When it's time for deployment, we usually create a deployment script. Anything that needs to be done as part of that deployment gets included in that script.

Running migrations is simply a matter of adding these Mongo scripts to the deployment script.

```sh
git pull origin release/3.2
./devops/build_release.sh

mongo ./migrations/000102_create_index_unique_people_email.js
mongo ./migrations/000103_update_people_removed_false.js
mongo ./migrations/000104_update_people_employers.js

./devops/update_solr_schema.sh
./devops/start_server.sh
```

I hope this helps with your Mongo future!
