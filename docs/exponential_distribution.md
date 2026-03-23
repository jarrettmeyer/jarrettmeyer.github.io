# Exponential distribution series

## Why this series exists

This is foundational operations research — exponential distributions, Poisson processes, Erlang, queueing theory. The material itself hasn't changed since the 60s and 70s. What's changed is where it sits in the curriculum.

In the 90s, this was graduate-level because simulation meant writing Fortran or using expensive tools like GPSS or SLAM. The barrier to entry was high, so the theory lived in grad programs. Today, much of it has trickled into undergraduate courses — Python and cheap compute make it accessible, and "data science" programs have pulled simulation concepts into broader curricula.

But the depth matters. Undergrads learn to _use_ `random.expovariate()`. Grad students learn _why_ it works — actually deriving the distributions, understanding why M/M/1 produces the results it does, connecting memorylessness to Markov chains. Too many practitioners use simulation tools without understanding the math underneath. They can run models but can't explain why the results make sense or diagnose when something is wrong.

This series is for the person who wants that deeper understanding without the graduate prerequisites. We'll go from first principles to working simulations, building each concept on the last.

## 1. ~~Exponential distribution~~

Done. See post at `/statistics/exponential-distribution`.

## 2. Poisson process

The Poisson process is the other side of the exponential coin. Where the exponential models the time _between_ events, the Poisson counts how many events occur in a fixed interval. We'll show that these are two views of the same underlying process and derive one from the other.

## 2a. Simulation of a Poisson process

Seeing the theory is one thing; watching it unfold is another. We'll simulate a Poisson process directly — generate exponential interarrival times, accumulate them into event timestamps, and count arrivals per interval. Then we'll overlay the simulated counts as a histogram against the theoretical Poisson PMF. The goal is to show how quickly the simulated distribution converges to the theoretical one, and to build intuition for what "Poisson arrivals" actually look like in a stream of events.

## 3. Erlang and k-Erlang

The Erlang distribution is the sum of k independent exponential random variables. It models the time until the kth event in a Poisson process — the waiting time for multiple arrivals rather than just one. We'll build intuition for how k shapes the distribution and where Erlang appears in practice (e.g., call center staffing, multi-stage service processes).

## 4. Generating random variates (inverse transform)

Theory is only useful if you can turn it into numbers. We'll derive the inverse transform method — turning uniform random numbers into exponential samples via $X = -\frac{1}{\lambda} \ln(1 - U)$ — and show why this works by connecting it back to the CDF. This is the fundamental technique that powers every simulation engine.

## 5. Memorylessness and Markov property

The exponential distribution is the only continuous distribution with the memoryless property: $P(X > s + t \mid X > s) = P(X > t)$. The system doesn't remember how long it's been waiting. We'll prove this, show why it matters for Markov chains, and explain why it makes exponential arrivals the natural building block for discrete event simulation.

## 6. Queueing theory (M/M/1, Little's Law)

This is where the distributions pay off. We'll start with the M/M/1 queue (exponential arrivals, exponential service, one server), derive key metrics like average wait time and queue length, and prove Little's Law: $L = \lambda W$. Then we'll extend to M/M/c — the same model with c parallel servers — which is the realistic scenario for staffing decisions: how many workers do you need to keep wait times acceptable? These results give you closed-form answers to questions that would otherwise require simulation.

## 7. Building a DES in Python

We bring everything together by building a simple discrete event simulation from scratch. Using only stdlib and numpy, we'll simulate a service queue: generate exponential arrivals, Erlang service times, track wait times, and compare our simulation results against the queueing theory formulas from the previous post. Time until first event, time until kth event, histograms vs. theoretical curves.

## 8. Modeling in AnyLogic

The same queue model, rebuilt in AnyLogic. We'll see what a professional simulation environment gives you — visual modeling, animation, built-in statistics collection — and how the concepts from the series map onto the tool's abstractions. The goal is to show that understanding the math makes you effective with any simulation platform, not just one.
