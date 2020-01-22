---
layout: post
title: "Refactoring for Intent"
date: 2012-08-08
description: Getting your idea across with better variable names
thumbnail:
---

Here's an interesting refactor that I did yesterday. It got a couple of "Ooohs" and "Aaahs" at work, so I thought it would be worth sharing.

### The Setup

We have a method with two different entry points. Depending on which values are set, there are two different ways to get the same answer.

```csharp
public string FirstValue { get; set; }

public string SecondValue { get; set; }

public string ThirdValue { get; set; }

public void DoSomething()
{
    if (FirstValue != null && SecondValue != null)
        PerformLiveCalculation();
    else if (ThirdValue != null)
        FetchHistoricalCalculationFromCache();
    else
        throw new NotImplementedException("I have no idea what you're trying to do.");
}
```

### The First Refactor

There's nothing revolutionary here. The first version wasn't at all difficult, since we're just checking for null values. All we're doing in the first refactor is changing the names for readability.

```csharp
public void DoSomething()
{
    if (HasFirstAndSecondValue)
        PerformLiveCalculation();
    else if (HasThirdValue)
        FetchHistoricalCalculationFromCache();
    else
        throw new NotImplementedException("I have no idea what you're trying to do.");
}

private bool HasFirstAndSecondValue
{
    get { return FirstValue != null && SecondValue != null; }
}

private bool HasThirdValue
{
    get { return ThirdValue != null; }
}
```

### The Second Refactor

This is where I mixed it up a bit. I changed the code from "code-language" to "business-language". For some reason, this seemed completely different to what other developers in the room were expecting.

```csharp
public void DoSomething()
{
    if (IsRequestingLiveCalculation)
        PerformLiveCalculation();
    else if (IsRequestingHistoricalCalculation)
        FetchHistoricalCalculationFromCache();
    else
        throw new NotImplementedException("I have no idea what you're trying to do.");
}

private bool IsRequestingLiveCalculation
{
    get { return FirstValue != null && SecondValue != null; }
}

private bool IsRequestingHistoricalCalculation
{
    get { return ThirdValue != null; }
}
```

Remember what [Uncle Bob](http://www.objectmentor.com/omTeam/martin_r.html) taught us: **clarity** is your number one goal as a developer. Working, unclean code might as well be useless.
