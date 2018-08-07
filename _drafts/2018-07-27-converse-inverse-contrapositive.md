---
title:  "Converse, Inverse, and Contrapositive"
layout: "post"
date:   2018-07-27
---

I know it's been a long time since you studied mathematic and logical proof. It has been for me, too. So, let's mind our P's and Q's and get into some truth tables.

Let's consider the following logical statement.

P: **I do my work.**

Q: **I get a paycheck.**

If I do my work, and then I get a paycheck, then this is a valid statement.

It I do my work, and then I **don't** get my paycheck, then this is **not** a valid statement. Why? You told me if I did my work, I would get my paycheck. I did my work, but then I didn't get paid. This invalidates the original statement.

What if I don't do my work? Well, I might get a paycheck, or I might not get my paycheck. The statement above doesn't tell me anything about what happens if I don't do my work. I can have some ideas in my head, but that's really just me making things up.

| P     | Q     | P → Q |
|:-----:|:-----:|:-----:|
| true  | true  | true  |
| true  | false | false |
| false | true  | true  |
| false | false | true  |

We can tell from this truth table that the only condition that produces an invalid statement is a true hypothesis and a false conclusion.

What happens when we flip things around? What can we conclude? If we swap the positions of P and Q, this is called the **convserse**. Note that the converse does not have the same logical outcome as the original statement.

| P     | Q     | P → Q | Q → P |
|:-----:|:-----:|:-----:|:-----:|
| true  | true  | true  | true  |
| true  | false | false | true  |
| false | true  | true  | false |
| false | false | true  | true  |

In the first case, the only invalid statement was **If I do my work, I will not get my paycheck." For the converse, the only invalid statement is **If I get my paycheck, I did not do my work." We can hear the logical incongruency.

We also have **inverse** statements. An inverse is when we negate the hypothesis and conclusion. Let's keep adding to our truth table.

| P     | Q     | P → Q | Q → P | ~P    | ~Q    | ~P → ~Q |
|:-----:|:-----:|:-----:|:-----:|:-----:|:-----:|:-------:|
| true  | true  | true  | true  | false | false | true    |
| true  | false | false | true  | false | true  | true    |
| false | true  | true  | false | true  | false | false   |
| false | false | true  | true  | true  | true  | true    |

Just like with the converse, only the third condition is an invalid statement. The original statement is not the logical equivalent of its inverse.

Finally, we have the **contrapositive**. This is what happens when we apply both the converse and inverse operations to a statement.
