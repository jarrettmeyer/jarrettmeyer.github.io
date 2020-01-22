---
title: "R: Using Gather to Stack Columns"
date: 2018-11-01
layout: "post"
tags: r
description: Making data manipulation just a little bit easier
thumbnail: /assets/images/r-logo.svg
---

The [R](https://www.r-project.org/) package [tidyverse](https://www.tidyverse.org/) uses [gather](https://tidyr.tidyverse.org/reference/gather.html) and [spread](https://tidyr.tidyverse.org/reference/spread.html) to pivot and depivot data. To know which function does what, you can remember that that `spread` makes the data frame wider and `gather` makes the data frame taller.

```r
library(tidyverse)

rm(list = ls())

set.seed(123)
opts = tibble(c("ONE", "TWO", "THREE"))
subs = tibble(c("S01", "S02", "S03", "S04"))

df = tibble(
  SEQ = seq_len(10),
  OPT = sample_n(opts, 10, replace = TRUE)[[1]],
  SUB = sample_n(subs, 10, replace = TRUE)[[1]],
  VALUE_1 = runif(10, 2, 4),
  VALUE_2 = runif(10, 4, 8),
  VALUE_3 = runif(10, 5, 7)
)
```

The R code above results in the following data frame.

| SEQ | OPT   | SUB | VALUE_1  | VALUE_2  | VALUE_3  |
| --- | ----- | --- | -------- | -------- | -------- |
| 1   | ONE   | S04 | 3.779079 | 7.852097 | 5.285600 |
| 2   | THREE | S02 | 3.385607 | 7.609196 | 5.829093 |
| 3   | TWO   | S03 | 3.281014 | 6.762821 | 5.827449 |
| 4   | THREE | S03 | 3.988540 | 7.181870 | 5.737691 |
| 5   | THREE | S01 | 3.311412 | 4.098455 | 5.304889 |
| 6   | ONE   | S04 | 3.417061 | 5.911184 | 5.277612 |
| 7   | TWO   | S01 | 3.088132 | 7.033838 | 5.466068 |
| 8   | THREE | S01 | 3.188284 | 4.865632 | 5.931925 |
| 9   | TWO   | S02 | 2.578319 | 5.272724 | 5.531945 |
| 10  | TWO   | S04 | 2.294227 | 4.926503 | 6.715655 |

In this case, we want to make the table taller, so we will be using the `gather` function.

```R
gather(df)
```

| key | value |
| --- | ----- |
| SEQ | 1     |
| SEQ | 2     |
| SEQ | 3     |
| SEQ | 4     |
| SEQ | 5     |
| SEQ | 6     |
| SEQ | 7     |
| SEQ | 8     |
| SEQ | 9     |
| SEQ | 10    |

Everything gets stacked into two columns. That's not quite what we want, but you can see how `gather` creates a table of key-value pairs. We just want the `VALUE_1`, `VALUE_2`, and `VALUE_3` columns.

```R
gather(df, key = COL_NAME, value = VALUE, VALUE_1, VALUE_2, VALUE_3) %>%
mutate(COL = str_sub(COL_NAME, 7)) %>%
select(SEQ, OPT, SUB, COL, VALUE)
```

Now, we will only gather the columns we want.

| SEQ | OPT   | SUB | COL | VALUE    |
| --- | ----- | --- | --- | -------- |
| 1   | ONE   | S04 | 1   | 3.779079 |
| 2   | THREE | S02 | 1   | 3.385607 |
| 3   | TWO   | S03 | 1   | 3.281014 |
| 4   | THREE | S03 | 1   | 3.988540 |
| 5   | THREE | S01 | 1   | 3.311412 |
| 6   | ONE   | S04 | 1   | 3.417061 |
| 7   | TWO   | S01 | 1   | 3.088132 |
| 8   | THREE | S01 | 1   | 3.188284 |
| 9   | TWO   | S02 | 1   | 2.578319 |
| 10  | TWO   | S04 | 1   | 2.294227 |
| 1   | ONE   | S04 | 2   | 7.852097 |
| 2   | THREE | S02 | 2   | 7.609196 |

That's what we want! I hope this helps with your next data cleaning project.
