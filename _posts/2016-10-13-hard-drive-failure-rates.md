---
title: Hard Drive Failure Rates
layout: post
date: 2016-10-13
tags: r statistics
thumbnail: /assets/images/r-logo.svg
---

Someone on [Reddit asked about storing 200TB of data](https://www.reddit.com/r/datascience/comments/574niq/where_can_i_cheaply_get_around_200_tb_of_storage/) as cheaply as possible. One response suggested to store the data locally and then selling the drives when the project was completed. I brought up disaster recovery. Was my question justified?

### What is the probability that at least one drive will fail?

The "standard" for hard drive mean time before failure (MTBF) is 300,000 hours. I found [this web site](https://www.backblaze.com/blog/hard-drive-reliability-q3-2015/) saying that the average hard drive annual failure rate AFR is 4.81%.

The relationship between MTBF and AFR is given by the following equation. (The 8760 is the number of hours in a year.)

\begin{equation}
AFR = 1 - exp\left(\dfrac{ -8760 }{ MTBF }\right)
\end{equation}

Solving for MTBF gives us the equation.

\begin{align}
AFR - 1 &= - exp\left(\dfrac{ -8760 }{ MTBF }\right) \\\
1 - AFR &= exp\left(\dfrac{ -8760 }{ MTBF }\right) \\\
log\left(1 - AFR\right) &= \dfrac{ -8760 }{ MTBF } \\\
MTBF &= \dfrac{ -8760 }{ log\left(1 - AFR\right) }
\end{align}

Substituting 0.0481 for AFR, we get a MTBF of approximately 178k hours. This is quite a bit worse than the standard of 300,000 hours. _Aside: This seems really high to me. I've been building my own computers since the 90s. I've had maybe 3 or 4 drive failures out of dozens of drives in my life. Having not collected my own data, let's go with it._

The author states that he needs the drives for 3 months, and we assume that this is a continuous operation. That is 2160 hours. Let's also assume that the author purchases 40 5TB hard drives.

Because we don't know anything else about the distribution of hard drive failures, let's assume a [binomial](https://en.wikipedia.org/wiki/Binomial_distribution) chance of failure. The probability of a drive failure in any given hour is \\( \frac{ 1 }{ MTBF} \\).

Assumptions:

-   Hard drive MTBF is approximately 178k hours.
-   We are using 40 5TB drives.
-   We assume drive failure follows a binomial distribution.

The probability that a single drive experiences 0 hours of failure in 2160 hours of operation is given by the following equation.

\begin{equation}
\binom{2160}{0} \left(\dfrac{1}{MTBF}\right)^{0} \left(1 - \dfrac{1}{MTBF}\right)^{2160}
\end{equation}

We can solve this in R easily enough with the `pbinom` function.

```r
succeed <- pbinom(0, 2160, 1/mtbf)
```

This is approximately 98.8% chance of a hard drive surviving for 3 months. We have 40 hard drives. The probability that all hard drives will survive for 3 months is given by the following.

```r
all_succeed <- succeed ^ 40
```

The chance that all drives succeed for 3 months is 61.5%.

**The chance that at least one hard drive of 40 will fail in 3 months is 38.5%.**

I recommend drive redundancy! Even if we rerun all of our equations with the assumed 300k hour standard, we still have a 25.0% of at least one drive failing. Backups are critical!

Did you find a problem with my solution? Let me know at [jarrettmeyer@gmail.com](mailto:jarrettmeyer@gmail.com).
