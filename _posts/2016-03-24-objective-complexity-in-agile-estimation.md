---
layout:   post
title:    "Objective Complexity in Agile Estimation"
date:     2016-03-24
---

*"This team's velocity should be higher,"* says the manager.

Project management is a game. Us vs. them. Developers vs. managers. In agile projects, points estimation and velocity is a game. Developers want credit for the difficulty of the work they do. Managers accuse developers of gaming the system to get more points.

If only we had an objective - not subjective - method of determining points.

## What's the point with all the points?

Let's look at a tool like [Jira](https://www.atlassian.com/software/jira). When we are asked to enter story points, this is the prompt we are given.

![Jira story points](/assets/images/jira-story-points-prompt.png)

Do you notice the hint wording used? Does the hint say *difficulty*? Who gets to decide difficulty? *Time*? Which developer is taking this task? These are subjective.

![knot](/assets/images/paracord-knot.jpg){: .align-right}

When we use points, we are estimating a measure of **complexity**.

> **complex**: (adjective) composed of many interconnected parts; compound; composite
>
> **complect**: (verb) to interweave, intertwine

Complexity, quite simply, is answering the question, *"How many parts of the application does this feature touch?"* And not just touch, but how do they touch? Does one function in one component call one function in another component? Or are the two components intricately bound?

Complexity is not time, although it may be correlated to time. A feature that touches more parts will require more time to write, more unit tests, and more validation procedures.

Complexity is not difficulty, although it may be correlated to difficulty. A feature that touches more parts might require more skill to get correct.

So what's a simple problem? Mathematically speaking:

> **simple**: (adjective) not complex or compound; single

To be clear: simple features can still be difficult, and simple features can still take a long time.

## Feature: User login

This is a feature that all developers should be intimately familiar with at this point.

> As a user, I want to be able to log on to the application. I should have the option to click a button to log on with Facebook. If I don't want to do that, I should be able to enter a username and password in a form.
>
> If the form is used, require that the email and password fields have content before submitting the form.
>
> If the form is used, all invalid login attempts should return an error with "Invalid credentials."
>
> If the Facebook button is used, if the email address is not found, redirect to the Create Account page.
>
> You may assume that creating an account is handled in a different feature.

How many parts of the application does this feature touch? If we ignore difficulty and time, it becomes quite a simple matter to **objectively** look at the number of interacting parts for this application. Values can be assigned on the interactions of those parts.

1. Fetch a `user` from a database by `email`.
2. Hash and compare a password.
3. Authenticate with Facebook in client JavaScript.
4. Controller or API.
5. Server-side error handling.
6. Simple UI.
7. Client-side form validation.
8. Client-side error handling.

If I were a developer on this application, I would handle this feature request in the following way.

1. Separate the email/password log on from the Facebook log on. These are two separate features that found their way into a single card.
2. Simple email/password user log on gets 5 points. Database, compare password, API endpoint, UI, JavaScript. It looks like I'm counting layers. For the most part, I am. I'm certainly not doing anything like counting classes or files touched.
3. Facebook log on gets 2 points.

Of course, these are *my* point values, and *my* point values should not be *your* point values. As you can see, the **complexity** of the task is objective. When I assign points, I start with complexity, but then apply modifiers for challenge.

## Low complexity, high difficulty

A feature can touch just a single file, have very little interaction with other parts (*low complexity*), and still be incredibly challenging. I once worked on a project where we allowed users to write their own scripts, along with previewing output in the client. Developers dreaded changes to this feature. While it was just one part of the application, the feature was kept separated from other parts, and it was well tested, no one wanted to touch it.

This user-scripting feature was not complex, but almost any change was very difficult and time consuming.

## High complexity, low difficulty

We are currently in the process of changing a site's styling to [material design](https://design.google.com/). We were already using [Bootstrap](http://getbootstrap.com/) on the project, with very few customizations. With that knowledge, adding a [material design theme](http://fezvrasta.github.io/bootstrap-material-design/) shouldn't be that difficult.

There are always some tweaks that need to be done when you modify a site's styling, but those aren't particularly difficult. Of course, the catch is that there are lots of screens in the application, and every screen will need to be verified. Also, there are multiple roles in the application. Our testers will need to review the application with different users to see all the different screens. In short, restyling a site is not difficult, but it is incredibly complex, as it touches every single template in the user interface.

## Hidden complexity

Where we fall short of our estimates is failing to understand the hidden complexity of the problems we work on. We had what appeared to be a simple feature. More often than not, we fail to see the unexpected or unintended interaction of software components.

> Whenever a company name is displayed, turn that into a link to the company.

That sounds really easy, right? We already had a `company` model. We just needed to add a `url` property to the model, drop a new column in the database and update some templates, right?

```html
{{"{{#if company.url "}}}}
  <a href="{{"{{ company.url "}}}}"><h3>{{"{{ company.name "}}}}</h3></a>
{{"{{else"}}}}
  <h3>{{"{{ company.name "}}}}</h3>
{{"{{/if"}}}}
```

We all (the developers) looked at this feature and proudly gave this a 1.

What we had forgotten is that this particular object is indexed by [Solr](http://lucene.apache.org/solr/). Foolishly, our Solr is pointing right to the object, and not a view. Solr yells and complains if you add a property to a document and don't tell Solr how to index the new property. So, this tiny little feature also required a lot of hair pulling and beating Solr into submission. Our Solr deployment process isn't nearly as automated as the rest of the project. So, not only did we break our search, the repair took some time while Solr re-indexed our documents.

By not using a view to populate Solr and dumping the database object directly into Solr, Solr had everything instead of only the necessary fields for indexing and search. We **complected** our problem. We created an interweaving of parts that didn't need to be there. By not creating a separate view to populate Solr, we inadvertently braided together our database schema with our Solr schema.

## Start with complexity

The next time you work on an agile project and are using points, remember to start with complexity. Think about the number of moving parts and how those parts are put together **in your project**. You may have a "simple" feature that talks to two different databases, an old AS/400 mainframe, and require knowledge of HTML, JavaScript, Python, [IBM RPG](https://en.wikipedia.org/wiki/IBM_RPG), and SQL. And only the developers, with their knowledge of the product architecture can answer those questions about complexity.

## References

* Definitions from [www.dictionary.com](www.dictionary.com).
