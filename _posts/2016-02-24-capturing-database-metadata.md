---
layout:   post
title:    "Capturing Database Metadata"
date:     2016-02-24
---

We have all seen database tables that have these two columns tagged onto the end of them.

```sql
CREATE TABLE my_table (
  id          serial,
  -- <snip: a lot of other columns>
  created_at  timestamp,
  updated_at  timestamp,
  PRIMARY KEY (id)
)
```

Generally, I'm fine with this, but only in the sense that (almost) every developer I know does it. However, this is a very poor data structure from a data science point of view.

On my current project, we have more requirements than just `created` and `updated`. We also need to capture times and users for `published` and `deleted`. Documents that can be published can also be unpublished and republished. They can also be restored from their deleted state. And now, we have confusion!

```sql
CREATE TABLE documents (
  id            serial,
  name          varchar(250),
  published_at  timestamp,
  deleted_at    timestamp,
  created_at    timestamp,
  updated_at    timestamp,
  PRIMARY KEY (id)
)
```

If you publish then unpublish a document, what should the `published_at` field be? Should it be set to `null`. Should it still retain the original publish date? Should we also include a `published` boolean value? What if it gets later republished? Does the date get reset to the new publish date or the old publish date. While there can certainly be business rules around this field, there is no keeping away from confusion.

There is an unavoidable lack of clarity in the data model. Even worse, I know from experience that this is the type of rule that is bound to change. "We want the date of first publication." A year later, "We want the date of last publication." A year later, "Hey, how many versions of this document have been published?"

### How to restore clarity

To fix this problem, do not store your document metadata with your document. Instead, consider this schema.

```sql
CREATE TABLE documents (
  id           serial,
  name         varchar(250),
  published    boolean,
  deleted      boolean,
  PRIMARY KEY  (id)
)

CREATE TABLE activity_logs (
  id           serial,
  ref_id       integer,
  ref_type     varchar(250),
  description  varchar(250),
  user_id      integer,
  timestamp    timestamp
)
```

We have successfully separated the metadata from the row. Our activity log can now be a series of events on a document.

```sql
SELECT * FROM activity_logs WHERE ref_type = 'document' AND ref_id = 12345;
```

| id   | ref_id | ref_type | description | user_id | timestamp           |
| ---: | -----: | :------- | :---------- | ------: | :------------------ |
| 389  | 12345  | document | created     | 31      | 2016-02-11 08:22:05 |
| 422  | 12345  | document | updated     | 31      | 2016-02-13 07:47:49 |
| 1065 | 12345  | document | published   | 58      | 2016-02-16 23:27:50 |
| 2381 | 12345  | document | unpublished | 58      | 2016-02-19 22:53:51 |
| 2433 | 12345  | document | updated     | 58      | 2016-02-20 18:46:45 |
| 2618 | 12345  | document | published   | 58      | 2016-02-23 09:00:56 |

With this model, we have a completely clear understanding of the past history. Even better: **we have absolutely no confusion** introduced into the data structure. There is no more asking, "What does this field mean?" The knowledge transfer from the data to the data interpreter or next programmer is absolute.

The document record will store a boolean value for `published`/`deleted`. This is to make queries simpler, without having to join to the `activity_logs` table.

### Why this makes for outstanding data science

From the data science point of view, tracking each event in the system can inform how users make their way through the software. How many times is a document published, unpublished, and published again? How many updates are documents having? Do different clients update documents at different rates? Do some clients publish once and then never touch their documents again? Are certain types of documents more prone to multiple updates?

This also opens the door to activity **streams**. An activity log event is something that happens in the application: a user is added, a document is published, a user searches for some term, etc. The activity log tells us *what happened* in the system.

The **stream** tells us *who cares* about the event. Suppose a new document with the keyword `"lightning"` is published. Look up users who have searches for the term `"lightning"` and add this publish event to their user stream. Even better, incorporate a synonyms table, so we also include users who have searched for `"thunder"` and `"storms"`. When a user follows a link from their stream, include that in the activity log as well. This provides a feedback loop to the publisher. "You published a document on "lightning". In the last 7 days, 283 users have researched your document."

Why is the feedback loop so important? **Because it is the answers that add value.** Good software developers and data scientists recognize that they are better at adding value than mediocre developers and data scientists. All of this software is a tool that should lead to answers. Answers depend on data, and data depends on questions. The software we write encodes these questions and saves the results as data.

Streams are fundamental to most businesses these days, although they might go by different names. Sometimes, it's called a feed. If you're Amazon, then they are called recommendations.

### But what about my requirements?

> "I have to put the `updated_at` and `updated_by` on the record. It's a business requirement."

Nope. You have to display that on the screen to the user. This is incredibly simple with a view or subquery.

```
SELECT a1.*
FROM activity_logs a1
INNER JOIN (
  SELECT ref_id, ref_type, MAX(timestamp) as timestamp
  FROM activity_logs
  WHERE description = 'updated'
  GROUP BY ref_id, ref_type
) a2
ON a1.ref_id = a2.ref_id
  AND a1.ref_type = a2.ref_type
  AND a1.timestamp = a2.timestamp;
```

If you want to get the first timestamp, instead of the last, just use `MIN()` instead of `MAX()`. If you want to get a `publish` or `created` or `deleted` event instead, change the line that says, `WHERE description = 'updated'`.

I have said it before, and I will say it again: **Our data model is not our display model.** This is the Active Record pattern, where the thing in the database is the same as the thing on the screen. That's great for trivial applications. More often than not, our applications are not so trivial. We all need to be better at understanding data structures.

### Conclusion

Good data models transfer knowledge. Great data models transfer knowledge without confusion, and they do not require a complicated code book or data dictionary.

Stay away from Active Record pattern thinking. It's a trap. It confines the developer; it is not flexible.
