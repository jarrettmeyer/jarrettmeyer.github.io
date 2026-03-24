# Exponential distribution series

## Why this series exists

This is foundational operations research — exponential distributions, Poisson processes, Erlang, queueing theory. The material itself hasn't changed since the 60s and 70s. What's changed is where it sits in the curriculum.

In the 90s, this was graduate-level because simulation meant writing Fortran or using expensive tools like GPSS or SLAM. The barrier to entry was high, so the theory lived in grad programs. Today, much of it has trickled into undergraduate courses — Python and cheap compute make it accessible, and "data science" programs have pulled simulation concepts into broader curricula.

But the depth matters. Undergrads learn to _use_ `random.expovariate()`. Grad students learn _why_ it works — actually deriving the distributions, understanding why M/M/1 produces the results it does, connecting memorylessness to Markov chains. Too many practitioners use simulation tools without understanding the math underneath. They can run models but can't explain why the results make sense or diagnose when something is wrong.

This series is for the person who wants that deeper understanding without the graduate prerequisites. We'll go from first principles to working simulations, building each concept on the last.

## 1. ~~Exponential distribution~~

Done. See post at `/statistics/exponential-distribution`.

## 2. ~~Poisson process~~

Done. See post at `/statistics/poisson-process`.

## 2a. ~~Simulation of a Poisson process~~

Done. See post at `/statistics/poisson-process-simulation`.

## 3. Discrete Event Simulation vs. Discrete Time Simulation

Two ways to simulate a process like a coffee shop queue or a clinical trial.

**Discrete Time Simulation (DTS)** runs a fixed clock tick. At each tick, it asks: did anything happen? Each patient, each provider, each drug, each possible outcome gets a Bernoulli draw. The work per tick grows multiplicatively with model complexity — patients × medications × adverse event profiles × efficacy outcomes. And the tick has to be small enough to capture rapid events accurately, so you can't just make it coarse. The cost is O(T / Δt), and the ratio to DES is 1 / (λΔt). For a trivial coffee shop example at 1-minute resolution, DTS is already 20× more expensive than it needs to be.

**Discrete Event Simulation (DES)** generates a time-to-next-event from Exp(λ) for each event type and puts them on a priority queue. The simulation jumps directly from event to event — nothing happens between events, so nothing is computed between events. A patient who stays stable for 6 months costs you nothing until month 6. The cost is O(number of events), which is O(λT). Work is proportional to what actually happens, not to elapsed time.

The difference is manageable for a single Poisson process. It becomes the difference between a model that runs in seconds and one that would run for days once you add multiple patients, providers, medications, adverse events, and efficacy outcomes — all interacting. This is why every serious healthcare simulation platform (Arena, Simul8, AnyLogic, R's `simmer`) is a DES engine. The exponential distribution isn't just a math curiosity; it's the engine underneath all of them.

## 4. Erlang and k-Erlang

The Erlang distribution is the sum of k independent exponential random variables. It models the time until the kth event in a Poisson process — the waiting time for multiple arrivals rather than just one. We'll build intuition for how k shapes the distribution and where Erlang appears in practice (e.g., call center staffing, multi-stage service processes).

## 5. Memorylessness and Markov property

Erlang is not memoryless — if you're waiting for the kth arrival, how long you've already waited tells you something about how much longer you'll wait. The exponential distribution is different. It's the only continuous distribution with the memoryless property: $P(X > s + t \mid X > s) = P(X > t)$. The system has no memory of how long it's been waiting. We'll prove this, show why it's what makes the Poisson process's independent increments work, and connect it to the Markov property. This also explains something that's been true since post #3: why DES can generate the next event time independently, without tracking history. That only works because of memorylessness. With Erlang service times, you'd need to track which phase you're in.

Memorylessness is powerful, but not everything follows an exponential distribution. For a distribution with $k$ parameters, you have $k+1$ problems: estimating each of the $k$ parameters, plus tracking how long you've been in the current state. Exponential is the only distribution where the $+1$ vanishes. With $\text{Exp}(\lambda)$, there's nothing to track — the past is irrelevant. If the system state changes (more baristas hired, arrival rate shifts), you can discard the current event and generate a fresh one from scratch. With any other distribution, you can't. You need to know how far through the distribution you already are before you can properly handle a state change.

## 6. Queueing theory (M/M/1, Little's Law)

This is where the distributions pay off. We'll start with the M/M/1 queue (exponential arrivals, exponential service, one server), derive key metrics like average wait time and queue length, and prove Little's Law: $L = \lambda W$. Then we'll extend to M/M/c — the same model with c parallel servers — which is the realistic scenario for staffing decisions: how many workers do you need to keep wait times acceptable? These results give you closed-form answers to questions that would otherwise require simulation.

## 7. Building a DES in Python

Open with the feedback loop problem: arrivals increase, capacity constraints bite, satisfaction drops, arrivals decrease again. Rates change based on system state. This is what a real model looks like — and it's why you need a proper DES. Then build one from scratch using only stdlib and numpy: exponential arrivals, Erlang service times, state-dependent rate updates, wait time tracking. Compare simulation results against the M/M/1 closed-form results from the previous post.

## 8. Modeling in AnyLogic

The same queue model, rebuilt in AnyLogic. We'll see what a professional simulation environment gives you — visual modeling, animation, built-in statistics collection — and how the concepts from the series map onto the tool's abstractions. The goal is to show that understanding the math makes you effective with any simulation platform, not just one.
