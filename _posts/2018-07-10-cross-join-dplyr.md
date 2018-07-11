---
title:      "Cross Joins with dplyr"
layout:     post
date:       2018-07-10
---

It's pretty easy to do a cross join with [dplyr](https://dplyr.tidyverse.org/), but it may not be immediately obvious. The only trick is to create a "fake" data column, and use the `full_join` function on this "fake" column.

```r
library(tidyverse)
tbl_1 <- tibble(val_1 = 1:50)
tbl_2 <- tibble(val_2 = 101:125)
```

A cross join for this data should look like the following data set.

| val_1 | val_2 |
|:-----:|:-----:|
| 1     | 101   |
| 1     | 102   |
| 1     | 103   |
| ...   | ...   |
| 2     | 101   |
| 2     | 102   |
| 3     | 103   |
| ...   | ...   |
| 50    | 123   |
| 50    | 124   |
| 50    | 125   |

Create a `fake` column, and assign a value. I chose `1`, but it can be any constant value. Create a `full_join`, then remove the `fake` column with the `select(-fake)` function.

```r
tbl_1$fake <- 1
tbl_2$fake <- 1
my_cross_join <- full_join(tbl_1, tbl_2, by = "fake") %>%
                 select(-fake)
```

That's all it takes! Now, go forth and cross join.
