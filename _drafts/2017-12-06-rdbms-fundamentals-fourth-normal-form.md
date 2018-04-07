---
title:    "RDBMS Fundamentals: Fourth Normal Form"
layout:   post
post:     2017-12-06
---

This is a continuation on a series of posts on [RDBMS Fundamentals](/projects#rdbms-fundamentals).

### The Rules for Fourth Normal Form

To satisfy fourth normal form -- 4NF -- the following rules must be met.

1. Satisfy all of the rules of [third normal form](/2017/12/06/rdbms-fundamentals-third-normal-form), and
2. There are no multi-valued dependencies in your table.

### The Problem Table

As usual, let's go to an example. Here, we have a table of automobile loan applications.

| application_key | application_date | applicant_name | down_payment | max_monthly_payment | vehicle |
| :--: | :--: | :--: | :--: | :--: | :--: |
| 1 | 2017-12-04 | David Danes | 4250.00 | 380.00 | 2014 Toyota Camry |
| 2 | 2017-12-04 | George Gusta | 1500.00 | 275.00 | 2013 Kia Optima |
| 3 | 2017-12-05 | Mike Mier | 0.00 | 330.00 | 2012 Fiat 500 |
| 4 | 2017-12-05 | Richard Rhodes | 3700.00 | 450.00 | 2017 Buick Encore |
| 5 | 2017-12-06 | Catherine Coats | 2300.00 | 515.00 | 2014 Chevrolet Volt |
| 6 | 2017-12-06 | Allen Adams | 2250.00 | 410.00 | 2014 Toyota Camry  |

While nothing looks particularly out of place in this table &mdash; it is all information relating to a single loan application &mdash; there is a non-trivial relationship between the loan, the maximum monthly payment, and the vehicle being purchased. Let's look at some examples.

```sql
SELECT  application_date, vehicle
FROM    applications
WHERE   vehicle LIKE '%toyota%';
```

This query can make it look like there is a non-trivial relationship between dates and when Toyotas are purchased.

```sql
SELECT  down_payment, max_monthly_payment
FROM    applications;
```

Is there a relationship between the amount of down payment an applicant has and the maximum monthly payment an applicant can afford? This relates directly to the purchasing power of the applicant. The purchasing power of the applicant (usually) applies to the vehicle someone buys.

### The Fix

The solution, as is usually the case, is to split this data into different tables. The `applications` table would now look like this.

| application_key | application_date | applicant_name |
| :--: | :--: | :--: |
| 1 | 2017-12-04 | David Danes |
| 2 | 2017-12-04 | George Gusta |
| 3 | 2017-12-05 | Mike Mier |
| 4 | 2017-12-05 | Richard Rhodes |
| 5 | 2017-12-06 | Catherine Coats |
| 6 | 2017-12-06 | Allen Adams |

Financial information would be moved to its own table. This table now contains exactly one type of data.

| puchasing_key | application_key | down_payment | max_monthly_payment |
| :--: | :--: | :--: | :--: |
| 1 | 1 | 4250.00 | 380.00 |
| 2 | 2 | 1500.00 | 275.00 |
| 3 | 3 | 0.00 | 330.00 |
| 4 | 4 | 3700.00 | 450.00 |
| 5 | 5 | 2300.00 | 515.00 |
| 6 | 6 | 2250.00 | 410.00 |

Finally, we move vehicles to its own table.

| vehicle_key | application_key | vehicle_description |
| :--: | :--: | :--: |
| 1 | 1 | 2014 Toyota Camry |
| 2 | 2 | 2013 Kia Optima |
| 3 | 3 | 2012 Fiat 500 |
| 4 | 4 | 2017 Buick Encore |
| 5 | 5 | 2014 Chevrolet Volt |
| 6 | 6 | 2014 Toyota Camry |

All data is still related through foreign keys, and we could still produce a view that showed all of the data from the original table, if needed.
