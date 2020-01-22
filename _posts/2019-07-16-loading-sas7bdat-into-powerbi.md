---
title: "Loading sas7bdat Files into Power BI"
layout: post
date: 2019-07-17
tags: powerbi r
description: Using R as a bridge language between SAS and Power BI
thumbnail: /assets/images/sas-logo.svg
---

Power BI has a lot of data sources. Unfortunately, it does not have a built-in connector for SAS `*.sas7bdat` files. The good news is that Power BI fully supports working with R data sources, and it is very simple to create a script to read in R files.

First, let's make sure you've installed the [sas7bdat](https://cran.r-project.org/package=sas7bdat) package into your local R installation.

```r
install.packages("sas7bdat")
```

<img src="/assets/images/powerbi-r-data-source.png" alt="Power BI R Data Source">

Now, all you need is a two line script to read in a SAS data set.

```r
library(sas7bdat)
df <- read.sas7bdat("//path/to/data/source.sas7bdat")
```

Super simple!
