---
title:    "RDBMS Fundamentals: Keys"
layout:   post
post:     2017-11-29
---

This is the first in a series of RDMBS fundamentals posts. Let's talk about keys. There are lots of keys in database design. Let's take a look at some of them.

### Primary Key

If we have any experience at all, we should understand the concept of a **primary key**. A primary key uniquely identifies a row in a database table. This might be an incrementing value, a GUID, or a combination of one or more columns already existing within the table. This can be a single column or multiple columns. A primary key is always a super key (see below). In most tables, the primary key may be a surrogate key, but this is not required.

### Natural Key

A natural key is a value that exists in the real world that is already unique. There are several existing natural keys in the world.

* Physical addresses are unique. There is only one 233 S Wacker Dr, Chicago, IL 60606. (That's the Willis/Sears Tower.) If there were more than one address, we would not be able to deliver mail.
* Bank account number. Within a bank, an account number cannot be duplicated. Outside of a single bank, the combination of routing number and account number is guaranteed to be unique.
* Vehicle identification number. VINs are required to uniquely identify a year, make, and model of car. Many times, the trim level is also encoded into the VIN, but this varies by manufacturer.

### Super Key

A super key is a set of columns that uniquely identifies a row. Let's look at the following table. Any super key could potentially become a primary key.

| A  | B  | C  | D  |
| -- | -- | -- | -- |
| a1 | b1 | c1 | d1 |
| a1 | b2 | c2 | d1 |
| a1 | b1 | c2 | d2 |
| a2 | b2 | c3 | d3 |
| a2 | b2 | c4 | d3 |

Every row is unique, so columns A+B+C+D is a super key. However, there are also other ways to uniquely identify a row. All of the available super keys are available below.

* **4 column super keys:** A+B+C+D
* **3 column super keys:** A+B+C, A+C+D, B+C+D
* **2 column super keys:** B+C, C+D
* **1 column super keys:** *none*

It is important to know that just because a super key exists, that does not mean it should be a key. For example, you may have a table where `first_name` + `last_name` is unique. However, this would never be considered a key, since we know from the real world that a name has no guarantee of being unique.

The applicable set theory for super keys means that any combination of columns that includes a super key is also guaranteed to be a super key. In the above example, B+C is a super key. This means that any combination of columns that includes B and C is also a super key. As expected, A+B+C, B+C+D and A+B+C+D are all super keys.

### Candidate Key

A **candidate key** is a super key with the minimal number of attributes. In the example above, both B+C and C+D are candidate keys. They are eligible to function as primary keys.

### Surrogate Key

A **surrogate key** is any time we use an artificial value to uniquely identify a row. Examples of surrogate keys include identities or [UUIDs](https://en.wikipedia.org/wiki/Universally_unique_identifier). A surrogate key has no business meaning. Ideally, surrogate key columns will be named `table_name_key` or `table_name_id`. I prefer `key`, because then it should be incredibly clear that a value has absolutely no business meaning whatsoever.

### Alternate Key

An alternate key is any super key that is not the primary key. It may be one or more columns. Using an alternate key in a SQL `WHERE` clause would be expected to return exactly one or zero rows. It would never return two or more rows.
