---
title:    "RDBMS Fundamentals: Second Normal Form"
layout:   post
post:     2017-12-04
---

In [our last post](/2017/12/01/rdbms-fundamentals-first-normal-form), we talked about first normal form. Now, we continue this discussion, talking about **second normal form** or *2NF*.

### Requirements for Second Normal Form

A table satisfies second normal form if:

* the table satisfies the requirements for first normal form, and
* all non-key columns depend only on the primary key.

The first requirement should make sense. But what about the second requirement? What does this mean in more plain English? There are two interpretations.

1. If the primary key changes (i.e. the row changes), it is expected that the data should change.
2. A non-primary key column does not depend on a column that is not the primary key column.

Suppose we go back to our table of books.

| key | title | check_out_date | check_in_date |
| :--: | :--: | :--: | :--: | :--: | :--: | :--: |
| 1 | Harry Potter and the Sorcerer's Stone | 2017-11-02 15:33:20 | 2017-11-24 08:09:43 |
| 2 | Jane Eyre | *null* | *null* |
| 3 | Island of the Blue Dolphins | 2017-07-15 10:13:52 | *null* |
| 4 | Curious George Goes Camping | 2017-03-14 9:05:10 | 2017-04-01 10:12:33 |

We also have an ISBN table. We know that ISBNs are assigned by publisher. Let's add a publisher column.

| book_key | isbn | publisher |
| :--: | :--: | :--: |
| 1 | 0439708184 | Scholastic |
| 1 | 1408883759 | Bloomsbury |
| 1 | 1408883767 | Bloomsbury |
| 2 | 1542047579 | AmazonClassics |
| 2 | 0141441143 | Penguin Classics |
| 3 | 0545289599 | HMH Books |
| 4 | 0395978351 | HMH Books |

Looks good, right? We know that Publisher does not belong on the books table, because different publishers will have different ISBN values, even for the same book. However, we still have a problem: **the ISBN depends on the publisher**. Publishers are assigned ranges of ISBN numbers. This table does not satisfy 2NF. Instead, this table should be broken into two different tables. We need a publisher table, and the `publisher_key` needs to be part of key for this table.

| key | publisher |
| :--: | :--: |
| 1 | Scholastic |
| 2 | Bloomsbury |
| 3 | AmazonClassics |
| 4 | Penguin Classics |
| 5 | HMH Books |

Our ISBN table should be redefined to look like the following.

| book_key | publisher_key | isbn |
| :--: | :--: | :--: |
| 1 | 1 | 0439708184 |
| 1 | 2 | 1408883759 |
| 1 | 2 | 1408883767 |
| 2 | 3 | 1542047579 |
| 2 | 4 | 0141441143 |
| 3 | 5 | 0545289599 |
| 4 | 5 | 0395978351 |

So there you go. Take a look at your tables. If you find two columns, and one of those columns depends on the other, then you have a 2NF problem!
