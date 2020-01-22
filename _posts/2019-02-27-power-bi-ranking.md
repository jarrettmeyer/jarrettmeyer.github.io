---
title: "Power BI: Ranking and Finding a Previous Value"
date: 2019-02-27
layout: post
tags: powerbi
description: Working with RANKX and FILTER to find a lagging value
thumbnail: /assets/images/powerbi-graph.svg
---

I've been working a lot with Microsoft [Power BI](https://powerbi.microsoft.com/) the past month. I'm finding a lot of the same types of problems. Here, I'm going to describe how to rank values within a grouping.

### Problem Description

I have a CSV that looks like the following. I need to rank the `VALUE` column by product. I am assuming that the `ID` column provides something resembling an order that values are inserted into the database. If I don't have this, I could easily use a `timestamp` column.

| ID  | PRODUCT_KEY | VALUE |
| :-: | :---------: | :---: |
|  1  | B01JHMVG5O  |  160  |
|  2  | B001GAOTSW  |  42   |
|  3  | B001GAOTSW  |  150  |
|  4  | B073H4VVC7  |  43   |
|  5  | B001GAOTSW  |  77   |
|  6  | B073H4VVC7  |  101  |
|  7  | B073H4VVC7  |  155  |
|  8  | B073H4VVC7  |  75   |
|  9  | B01JHMVG5O  |  75   |
| 10  | B01JHMVG5O  |  46   |
| 11  | B001GAOTSW  |  106  |
| 12  | B073H4VVC7  |  158  |
| 13  | B073H4VVC7  |  117  |
| 14  | B01JHMVG5O  |  161  |
| 15  | B01JHMVG5O  |  139  |

The `RANK` column may be defined with the following [DAX](https://docs.microsoft.com/en-us/dax/data-analysis-expressions-dax-reference) expression.

```dax
RANK = RANKX(FILTER(sales001,
                    sales001[PRODUCT_KEY] = EARLIER(sales001[PRODUCT_KEY])),
             sales001[INVENTORY_VALUE], , ASC)
```

Now that we know the rank by product, I would like to know what the previous high value. I want to lookup a value, where the `PRODUCT_KEY` matches and the `RANK` is equal to `RANK - 1`.

```dax
PREV_HIGH_VALUE = LOOKUPVALUE(sales001[VALUE], sales001[PRODUCT_KEY], sales001[PRODUCT_KEY], sales001[RANK], sales001[RANK] - 1)
```

Finally, I want to know the growth from the previous high to the current value. This is a simple subtraction problem. We just need to make sure we check for blanks.

```dax
GROWTH_FROM_PREV_HIGH = sales001[VALUE] - IF(ISBLANK(sales001[PREV_HIGH_VALUE]), 0, sales001[PREV_HIGH_VALUE])
```

The final table should look like the following.

| ID  | PRODUCT_KEY | VALUE | RANK | PREV_HIGH_VALUE | GROWTH_FROM_PREV_HIGH |
| :-: | :---------: | :---: | :--: | :-------------: | :-------------------: |
|  1  | B01JHMVG5O  |  160  |  4   |       139       |          21           |
|  2  | B001GAOTSW  |  42   |  1   |                 |          42           |
|  3  | B001GAOTSW  |  150  |  4   |       106       |          44           |
|  4  | B073H4VVC7  |  43   |  1   |                 |          43           |
|  5  | B001GAOTSW  |  77   |  2   |       42        |          35           |
|  6  | B073H4VVC7  |  101  |  3   |       75        |          26           |
|  7  | B073H4VVC7  |  155  |  5   |       117       |          38           |
|  8  | B073H4VVC7  |  75   |  2   |       43        |          32           |
|  9  | B01JHMVG5O  |  75   |  2   |       46        |          29           |
| 10  | B01JHMVG5O  |  46   |  1   |                 |          46           |
| 11  | B001GAOTSW  |  106  |  3   |       77        |          29           |
| 12  | B073H4VVC7  |  158  |  6   |       155       |           3           |
| 13  | B073H4VVC7  |  117  |  4   |       101       |          16           |
| 14  | B01JHMVG5O  |  161  |  5   |       160       |           1           |
| 15  | B01JHMVG5O  |  139  |  3   |       75        |          64           |

That's it! Have fun exploring your data!

### Notes

The sample CSV is available at the following location: [sales001.csv](https://github.com/jarrettmeyer/jarrettmeyer.github.io/blob/master/assets/csv/sales001.csv).
