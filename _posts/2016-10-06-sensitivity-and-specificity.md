---
title:  "Sensitivity and Specificity"
layout: post
date:   2016-10-06
---

```
TP = True Positive, test has a positive result and subject is positive.
FP = False Positive, test has a positive result, but subject is negative.
TN = True Negative, test has a negative result, and subject is negative.
FN = False Negative, test has a negative result, but subject is positive.
```

The **sensitivity** of a test is the probability of a correct, positive test outcome, given that the subject is positive.

The **specificity** of a test is the probability of a correct, negative test outcome, given that the subject is negative.

The **positive predictive value** of a test is the probability that a subject is positive, given a positive test outcome.

The **negative predictive value** of a test is the probability that a subject is negative, given a negative test outcome.

The **accuracy** of a test is the probability that a test correctly codes for positive and negative subjects.

| Term                      | Equation |
|:-------------------------:|:--------:|
| sensitivity               | \\( \dfrac{ TP }{ TP + FN } \\)                |
| specificity               | \\( \dfrac{ TN }{ FP + TN } \\)                |
| positive predictive value | \\( \dfrac{ TP }{ TP + FP } \\)                |
| negative predictive value | \\( \dfrac{ TN }{ TN + FN } \\)                |
| accuracy                  | \\( \dfrac{ TP + TN }{ TP + FP + TN + FN } \\) |

### Example

Let's assume you have a disease with a very rare prevalence, with 1 in 2000 people in the general population have the disease. Suppose you create a very good test for this disease that is 99.9% sensitivity and 98% specificity.

Let's build a chart, to see what these numbers would look like. Let's assume 1000 people have the disease. We know the test sensitivity is 99.9%. This means that \\( 1000 \times 0.999 = 999 \\) will be true positives. From this, we can show that \\( 1000 - 999 = 1 \\) will be a false negative.

The total number of people without the disease is set by our disease prevalence, or 0.05%. We built our table with 1000 having the disease. Our total population, therefore, is \\( \dfrac{ 1000 }{ 0.0005 } = 2000,000 \\). The total number of people who do not have the disease is \\( 2000000 - 1000 = 1999000 \\).

We are told the specificity of the test is 98%. This means that \\( 1,999,999 \times 0.98 = 1,959,020 \\) subjects are true negatives and \\( 1,999,999 \times 0.02 = 39,980 \\) are false negatives.

| Test     | Subject has disease | Subject does not have disease |
|----------|:-------------------:|:-----------------------------:|
| positive |   999               |     39,980                    |
| negative |     1               |  1,959,020                    |
|          |  1000               |  1,999,000                    |

Given this information, if you test positive for the disease, what is the probability that you actually have the disease? This is the positive predictive value of the test, or \\( \dfrac{ 999 }{ 999 + 39980 } = 0.0244 \\).

So, even with a very accurate test, when the actual disease prevalence is very, very low, a positive test is only 2.4% chance that you have a disease. Many diseases have a very low prevalence. For example, there are approximately 180,000 cases of prostate cancer each year in the U.S., a country with approximately 120,000,000 men. This is a disease prevalence of only 0.15%.

However, if we do the exact same chart for a more common disease, like influenza, our outcomes change dramatically. Approximately 20% of the U.S. population will contract the flu in a given year. Again, let's build a chart based on 1000 cases of the disease.

| Test     | Subject has disease | Subject does not have disease |
|----------|:-------------------:|:-----------------------------:|
| positive |   999               |    80                         |
| negative |     1               |  3920                         |
|          |  1000               |  4000                         |

Now, the positive predictive value of this test is \\( \dfrac{ 999 }{ 999 + 80 } = 0.926 \\), or 92.6%. If there were an influenza test this accurate, if the test claims you have the flu, then you probably have the flu.
