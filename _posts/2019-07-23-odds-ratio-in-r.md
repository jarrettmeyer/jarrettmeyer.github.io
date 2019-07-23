---
date:   2019-07-23
layout: post
title:  "Calculating Odds Ratio in R"
tags:   r statistics
---

I have been working on several [volcano plots](https://observablehq.com/@jarrettmeyer/volcano-plot) lately. That means I've been pouring through many thousands of records of clinical trial data. Typically, when we give a patient a higher dose, we fix whatever indicator we are trying to remedy, and we also see a greater rate of adverse events (AEs). Volcano plots give us the ability to quickly discern just how much frequency of AE increases as dose increases.

```r
treatments <- c("Placebo", "Low Dose", "High Dose")
ae_present <- c("No", "Yes")

dat <- matrix(c(85, 1, 80, 5, 77, 8), nrow = 3, ncol = 2, byrow = TRUE)
dimnames(dat) <- list("Treatments" = treatments, "AE Present" = ae_present)
```

If you've done everything correctly, this data should appear as the following table.

```
              AE Present
Treatments     No   Yes
  Placebo      85     1
  Low Dose     80     5
  High Dose    77     8
```

To compute the odds ratio, we will use the [`epitools`](https://rdrr.io/cran/epitools/) pacakge, which is available on CRAN.

```r
library(epitools)
or_fit <- oddsratio(dat)
```

Let's check out the contents of the `or_fit` variable.

```
$data
              AE Present
Treatments     No   Yes  Total
  Placebo      75     1     86
  Low Dose     80     5     85
  High Dose    77     8     85
  Total       242    14    256

$measure
             odds ratio with 95% C.I.
Treatments    estimate        lower       upper
  Placebo     1.000000           NA          NA
  Low Dose    4.755327    0.7107625    127.7539
  High Dose   7.804760    1.3552471    199.6285

$p.value
             two-sided
Treatments    midp.exact   fisher.exact   chi.square
  Placebo             NA             NA           NA
  Low Dose    0.11629373     0.11732592   0.09353659
  High Dose   0.01784242     0.01801546   0.01572061
```

Using the same `epitools` package, we can also compute the [relative risk](https://en.wikipedia.org/wiki/Risk_ratio) (risk ratio) for the various treatments.

```r
rr_fit <- riskratio(dat)
```

This `rr_fit` data looks like the following.

```
$data
              AE Present
Treatments     No   Yes  Total
  Placebo      75     1     86
  Low Dose     80     5     85
  High Dose    77     8     85
  Total       242    14    256

$measure
             risk ratio with 95% C.I.
Treatments    estimate        lower      upper
  Placebo     1.000000           NA         NA
  Low Dose    5.058824    0.6035846   42.39952
  High Dose   8.094118    1.0345936   63.32413
```

That's it! Now, go forth and analyze!
