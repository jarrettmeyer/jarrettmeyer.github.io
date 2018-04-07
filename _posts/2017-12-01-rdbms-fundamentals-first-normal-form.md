---
title:    "RDBMS Fundamentals: First Normal Form"
layout:   post
post:     2017-12-01
---

In table design, we will frequently talk about **normal forms**. The first of these, coincidentally, is first normal form, or *1NF*. Let's start with a sample table. Our table will have a list of books, ISBN values, authors, check-out date, and check-in date.

| key | isbn | title | author | check_out_date | check_in_date |
| :--: | :--: | :--: | :--: | :--: | :--: |
| 1 | 0439708184, 1408883759, 1408883767 | Harry Potter and the Sorcerer's Stone | J.K. Rowling | 2017-11-02 15:33:20 | 2017-11-24 08:09:43 |
| 2 | 1542047579, 0141441143 | Jane Eyre | Charlotte Bronte | *null* | *null* |
| 3 | 0545289599 | Island of the Blue Dolphins | Scott O'Dell | 2017-07-15 10:13:52 | *null* |
| 4 | 0395978351 | Curious George Goes Camping | Margaret Rey, H.A. Rey | 2017-03-14 9:05:10 | 2017-04-01 10:12:33 |

A table is said to be in **first normal form** (or **1NF**) when it has no sets as elements and has no repeated columns. The table above is *not* in 1NF because there are cells with multiple values. We could begin to fix our table by adding new columns to the original. We can see that ISBN has a maximum of three values and author has a maximum of two values.

| key | isbn_1 | isbn_2 | isbn_3 | title | author_1 | author_2 | check_out_date | check_in_date |
| :--: | :--: | :--: | :--: | :--: | :--: |
| 1 | 0439708184 | 1408883759 | 1408883767 | Harry Potter and the Sorcerer's Stone | J.K. Rowling | *null* | 2017-11-02 15:33:20 | 2017-11-24 08:09:43 |
| 2 | 1542047579 | 0141441143 | *null* |Jane Eyre | Charlotte Bronte | *null* | *null* | *null* |
| 3 | 0545289599 | *null* | *null* | Island of the Blue Dolphins | Scott O'Dell | *null* | 2017-07-15 10:13:52 | *null* |
| 4 | 0395978351 | *null* | *null* | Curious George Goes Camping | Margaret Rey | H.A. Rey | 2017-03-14 9:05:10 | 2017-04-01 10:12:33 |

Our second version of our books table satisfies the first condition of 1NF. However, we still do not satisfy the second condition of 1NF. We have repeated columns that hold the same piece of data. These columns need to be exported to another table. Let's create tables for ISBN and author.

The third version of our books table will look like the following.

| key | title | check_out_date | check_in_date |
| :--: | :--: | :--: | :--: | :--: | :--: |
| 1 | Harry Potter and the Sorcerer's Stone | 2017-11-02 15:33:20 | 2017-11-24 08:09:43 |
| 2 | Jane Eyre | *null* | *null* |
| 3 | Island of the Blue Dolphins | 2017-07-15 10:13:52 | *null* |
| 4 | Curious George Goes Camping | 2017-03-14 9:05:10 | 2017-04-01 10:12:33 |

Our new ISBN table will look like this.

| book_key | isbn |
| :--: | :--: |
| 1 | 0439708184 |
| 1 | 1408883759 |
| 1 | 1408883767 |
| 2 | 1542047579 |
| 2 | 0141441143 |
| 3 | 0545289599 |
| 4 | 0395978351 |

Finally, this is our new authors table.

| book_key | author |
| :--: | :--: |
| 1 | J.K. Rowling |
| 2 | Charlotte Bronte |
| 3 | Scott O'Dell |
| 4 | Margaret Rey |
| 4 | H.A. Rey |

And that's it! That's how 1NF works! Think about the number of times that you've seen tables that have columns like `primary_telephone`, `alternate_telephone_1`, `alternate_telephone_2`. What about `home_address`, `work_address`? We see columns like this quite frequently. Now, let's get rid of them.

Go forth and normalize those tables!
