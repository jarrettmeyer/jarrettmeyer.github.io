---
title: "Creating a Table of Numbers"
layout: post
date: 2017-12-07
description:
thumbnail: /assets/images/sql-server-logo.png
---

Another helpful, common database task, added to this blog for posterity.

The script below works in SQL Server. You may need to make a few modifications for another database platform. This version relies on `sys.all_objects`, creates a maximum of approximately 5.4M rows, and takes about 2 minutes to run on my development laptop. Since this is a reference table, all columns will be materialized (i.e. there are no computed columns). This table will be built once, and never have any future inserts. Populating the other columns is intended to make all reads just a little bit faster.

{% gist jarrettmeyer/ff8badfb39942db270011b91f9b953b9 create_numbers.sql %}

The three result sets from this query are as follows.

|    c    |
| :-----: |
| 2000001 |

| number | formatted_number | number_suffix |
| :----: | :--------------: | :-----------: |
|   0    |        0         |      th       |
|   1    |        1         |      st       |
|   2    |        2         |      nd       |
|   3    |        3         |      rd       |
|   4    |        4         |      th       |
|   5    |        5         |      th       |
|   6    |        6         |      th       |
|   7    |        7         |      th       |
|   8    |        8         |      th       |
|   9    |        9         |      th       |

| number  | formatted_number | number_suffix |
| :-----: | :--------------: | :-----------: |
| 1999991 |    1,999,991     |      st       |
| 1999992 |    1,999,992     |      nd       |
| 1999993 |    1,999,993     |      rd       |
| 1999994 |    1,999,994     |      th       |
| 1999995 |    1,999,995     |      th       |
| 1999996 |    1,999,996     |      th       |
| 1999997 |    1,999,997     |      th       |
| 1999998 |    1,999,998     |      th       |
| 1999999 |    1,999,999     |      th       |
| 2000000 |    2,000,000     |      th       |

Happy querying!
