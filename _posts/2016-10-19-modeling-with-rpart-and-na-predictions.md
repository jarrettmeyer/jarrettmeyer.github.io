---
title:   Modeling with RPart and NA Predictions
layout:  post
date:    2016-10-19
---

I ran into a problem this past week of making predictions with trees when you have `NA` values as part of your prediction.

Let's quickly create a data set to demonstrate the problem. In our example, both `var1` and `var2` are dependent on the `class`. Our final input, `var3`, is just some random noise added to the problem.

```r
rm(list = ls())
set.seed(6789)
class <- sample(0:2, 300, replace = TRUE, prob = c(0.5, 0.3, 0.2))
var1 <- class * rnorm(300, 3, 1)
var2 <- class * rnorm(300, 6, 1)
var3 <- rnorm(300, 1, 0.2)
training_data <- data.frame(class = class, var1 = var1, var2 = var2, var3 = var3)
training_data$class <- as.factor(training_data$class)
str(training_data)
## 'data.frame':	300 obs. of  4 variables:
##  $ class: Factor w/ 3 levels "0","1","2": 1 2 2 2 1 1 3 1 1 3 ...
##  $ var1 : num  0 2.05 2.66 1.66 0 ...
##  $ var2 : num  0 3.64 4.74 5.08 0 ...
##  $ var3 : num  1.129 1.166 0.769 0.949 1.129 ...
```

Now we are ready to train our model.

```r
model_rpart <- train(class ~ ., data = training_data, method = "rpart")
print(model_rpart$finalModel)
## n= 300
##
## node), split, n, loss, yval, (yprob)
##       * denotes terminal node
##
## 1) root 300 159 0 (0.4700000 0.3300000 0.2000000)  
##   2) var1< 0.01965866 141   0 0 (1.0000000 0.0000000 0.0000000) *
##   3) var1>=0.01965866 159  60 1 (0.0000000 0.6226415 0.3773585)  
##     6) var2< 8.364213 99   0 1 (0.0000000 1.0000000 0.0000000) *
##     7) var2>=8.364213 60   0 2 (0.0000000 0.0000000 1.0000000) *
```

Inspecting our final model reveals that, as expected, `var3` has no impact on the decision tree. It was just random noise. Only `var1` and `var2` are included in the decision tree. However, we now encounter two problems.

**First Problem:** If we try to predict with values with `NA`, R will give us an answer, even when it shouldn't be able to do so.

Let's demonstrate with some test data.

```r
test_data <- training_data[0,]
test_data[1,] <- c(NA,  3,  7, 0)
test_data[2,] <- c(NA,  0,  2, 0)
test_data[3,] <- c(NA,  2, 10, 0.2)
test_data[4,] <- c(NA, NA,  8, 0.3)
test_data[5,] <- c(NA, NA, NA, 0.1)
test_data[6,] <- c(NA,  0,  6, NA)
test_data[7,] <- c(NA,  0,  1, 1)
print(test_data)
##   class var1 var2 var3
## 1  <NA>    3    7  0.0
## 2  <NA>    0    2  0.0
## 3  <NA>    2   10  0.2
## 4  <NA>   NA    8  0.3
## 5  <NA>   NA   NA  0.1
## 6  <NA>    0    6   NA
## 7  <NA>    0    1  1.0
```

Now, let's predict against this test data.

```r
predict(model_rpart, newdata = test_data, type = "prob", na.action = na.rpart)
##    0  1  2
## 1  0  1  0
## 2  1  0  0
## 3  0  0  1
## 4  0  1  0
## 5  0  1  0
## 6  1  0  0
## 7  1  0  0
```

The `predict` function successfully predicted every row of the test data, even when we had `NA` values that should have made this task impossible. We should not get predictions for rows 4 and 5. The tree cannot be satisfied.

**Second Problem:** If we use `na.omit`, then R removes too many rows, even removing row 6. In this case, row 6 should not be removed because it has no impact on the outcome. We have an `NA` value, but it is for `var3`, so R has all of the information it needs to make a prediction.

```r
predict(model_rpart, newdata = test_data, type = "prob", na.action = na.omit)
##    0  1  2
## 1  0  1  0
## 2  1  0  0
## 3  0  0  1
## 7  1  0  0
```

### Solution

My solution to this is to create a new training data set with only the relevant columns. Fortunately, we can automate this process a little bit.

```r
keep_cols <- subset(model_rpart$finalModel$frame, var != "<leaf>", select = c("var"))
keep_cols <- as.character(keep_cols$var)
training_data_2 <- subset(training_data, select = c("class", keep_cols))
str(training_data_2)
## 'data.frame':	300 obs. of  3 variables:
##  $ class: Factor w/ 3 levels "0","1","2": 1 2 2 2 1 1 3 1 1 3 ...
##  $ var1 : num  0 2.05 2.66 1.66 0 ...
##  $ var2 : num  0 3.64 4.74 5.08 0 ...
```

In our reduced training data set, `var3` has been removed. If we train on this reduced set, we should get the same model.

```r
model_rpart_2 <- train(class ~ ., data = training_data_2, method = "rpart")
print(model_rpart_2$finalModel)
## n= 300
##
## node), split, n, loss, yval, (yprob)
##       * denotes terminal node
##
## 1) root 300 159 0 (0.4700000 0.3300000 0.2000000)  
##   2) var1< 0.01965866 141   0 0 (1.0000000 0.0000000 0.0000000) *
##   3) var1>=0.01965866 159  60 1 (0.0000000 0.6226415 0.3773585)  
##     6) var2< 8.364213 99   0 1 (0.0000000 1.0000000 0.0000000) *
##     7) var2>=8.364213 60   0 2 (0.0000000 0.0000000 1.0000000) *
```

We can use `na.omit`, since we have a model that only considers the relevant variables.

```r
test_data_2 <- subset(test_data, select = keep_cols)
predict(model_rpart_2, test_data_2, type = "prob", na.action = na.omit)
##    0  1  2
## 1  0  1  0
## 2  1  0  0
## 3  0  0  1
## 6  1  0  0
## 7  1  0  0
```

Now, our solution is much closer to what we'd expect. We still get a prediction for row 6. We do not get predictions for rows 4 and 5.

This solution is not perfect. In fact, far from it. Suppose you had a test case where `var1 = 0.01` and `var2 = NA`. This should be correctly classified as `class = 0`. In this case, it shouldn't matter that `var2 = NA`. Perhaps someone should write an R package that has a better `na.action` that accounts for the decision tree.

Is there a solution that I'm not yet aware of? If so, please let me know at [jarrettmeyer@gmail.com](mailto:jarrettmeyer@gmail.com).
