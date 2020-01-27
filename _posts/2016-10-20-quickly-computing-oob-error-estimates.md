---
title: Quickly Computing OOB Error Estimates
layout: post
date: 2016-10-20
description:
thumbnail: /assets/images/r-logo.png
---

If you're using `caret` or `randomForest`, it can be helpful to compute the OOB error estimate. This value is given when you print the model output; however, as far as I can tell, the value is not available as a property. _If I'm wrong about this, please let me know._

```r
print(my_model$finalModel)
##
## Call:
##  randomForest(x = x, y = y, mtry = param$mtry, nTree = ..1)
##                Type of random forest: classification
##                      Number of trees: 500
## No. of variables tried at each split: 2
##
##         OOB estimate of  error rate: 0.76%
## Confusion matrix:
##      A    B    C    D    E class.error
## A 3902    3    1    0    0 0.001024066
## B   15 2636    6    1    0 0.008276900
## C    0   16 2376    4    0 0.008347245
## D    0    0   51 2200    1 0.023090586
## E    0    0    1    6 2518 0.002772277
```

The OOB error estimate is given in the output as `OOB estimate of error rate: 0.76%`. This is computed by finding the probability that any given prediction is not correct within the test data. Fortunately, all we need for this is the confusion matrix of the model.

\begin{equation}
1 - accuracy \\\
1 - \frac{correct\ predictions}{all\ predictions} \\\
1 - \frac{3902 + 2636 + 2376 + 2200 + 2518}{3902 + 15 + 3 + 2636 + 16 + 1 + 6 + 2376 + 51 + 1 + 1 + 4 + 2200 + 6 + 1 + 2518} \\\
1 - \frac{13632}{13737} \\\
1 - 0.9924 \\\
0.0076
\end{equation}

This is incredibly easy to compute in R with the `sum` and `diag` functions.

```r
computeOOBErrEst <- function (x)
{
  cm <- x$confusion
  cm <- cm[, -ncol(cm)]
  1 - sum(diag(cm)) / sum(cm)
}
```

Plugging in our final model gives us the following result.

```r
computeOOBErrEst(my_model$finalModel)
## 0.00764359
```

This value is the 0.76% that we saw when we first printed our model output.
