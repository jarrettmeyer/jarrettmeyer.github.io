---
title: "Knitr Tip: Create More Variables"
layout: post
date: 2016-10-25
thumbnail: /assets/images/r-logo.svg
---

If you're writing [Knitr](http://yihui.name/knitr/) documents, then you need to create more variables. A lot more. I have been reviewing projects, and I am finding literally dozens of instances where an author changed his or her mind while working on whatever it was. You see something like this.

>     ## Accuracy 0.9821
>
> ...
>
> The resulting accuracy is 95%.

The author must have changed something in his or her design, and accuracy has improved. The R output and the supporting text do not line up.

Or another one I've seen often.

>     ## Resampling: Cross-Validated (10 fold)
>
> ...
>
> Our training control will use k-fold cross validation, where k = 5.

Obviously, the text of the document and the R output **do not match**! This is so easy to fix, too. Create variables and reference them in your R code and your text. For example, if we create a `cv_num_folds` variable, and reference that variable appropriately, we can avoid all future issues of code/text misalignment.

```r
cv_num_folds <- 10
control_validation <- trainControl(method = "cv", number = cv_num_folds)
```

In our text, we can now write...

```
Our training control will use k-fold cross validation, where k = `r cv_num_folds`.
```

> Our training control will use k-fold cross validation, where k = 10.

Please, clean up those reports!
