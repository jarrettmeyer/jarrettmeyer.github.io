---
layout:   post
title:    "Moving beyond basic CRUD APIs"
date:     2016-06-24
---

In a complicated API, it can be quite difficult to parse business rules. Often, the `PUT` endpoint becomes overloaded with every possible thing that can happen to a domain object. Let's look at something simple like a task list. Our traditional REST API would look something like this.

```
GET     /api/tasks
GET     /api/tasks/:id
POST    /api/tasks
PUT     /api/tasks/:id
DELETE  /api/tasks/:id
```

For CRUD operations, there's nothing wrong with this type of architecture. However, once our application becomes sufficiently complicated, an edit is more than just an edit.

Suppose our `task` object belongs to queues. Suppose it can be assigned and reassigned. Suppose there is a complex workflow. Suppose that the various actions that may be performed on a `task` can invalidate caches, trigger emails, or kick off automated report generation.

If we place all of this potential logic in the `PUT` endpoint, figuring out what happened can become a nightmare.

```
PUT /api/tasks/4823613
{
  assignedTo: 7243,
  createdAt: 'Tue Apr 5 2016 15:36:38 GMT-0400 (EDT)',
  deleted: false,
  description: 'This is a sample task for the blog post',
  id: 4823613,
  queue: 315,
  startedAt: 'Wed May 25 2016 07:54:12 GMT-0400 (EDT)',
  status: 'In Progress'
}
```

If that's your `PUT` data, what happened? A status change? Assigned to a different user? Was the task assigned to a different queue? If this were a simple CRUD operation, we wouldn't care. We'd just send an `UPDATE` command to a database and go about our lives.

```sql
UPDATE tasks
SET assignedTo = $1, deleted = $2, description = $3, queue = $4, startedAt = $5, status = $6
WHERE id = $7;
```

Not really a whole lot going on there worth considering. However, once we start adding business rules to the application, this is an insufficient solution.

### How would we fix this scenario?

Don't `PUT` updates; instead `POST` actions.

```
POST /api/actions
{
  assignedTo: 7243,
  task: 4823613,
  type: 'assign task'
}
```

With this type of architecture, determining what happened is a no-brainer.

```js
app.post('/api/actions', (request, response, next) => {
  var actionHandler = getActionFor(request.data.type);
  return actionHandler.handle(request)
    .then(result => {
      return response.status(result.status || 200).json(result.data);
    })
    .catch(next);
});
```

This makes for an incredibly simple API layer. Every action is completely encapsulated into its own function. An action handler would look like the following.

```js
module.exports = {
  canHandle: (type) => {
    return type === 'assign task';
  },

  handle: (request) => {
    let result = {
      data: null,
      status: 200
    };
    return fetchUserById(request.data.assignedTo)
      .then(user => {
        if (!user || !user.active) {
          throw new InvalidData('User is not valid.');
        }
        result.user = user;
        return fetchTaskById(request.params.id);
      })
      .then(task => {
        return verifyUserCanBeAssignedTask(result.user, task);
      })
      .then(ok => {
        if (!ok) {
          throw new InvalidData('User can be assigned this task.');
        }
        let diff = {
          assignedTo: request.data.assignedTo,
          updatedBy: request.user.id,
        };
        return updateTask(request.params.id, diff);
      })
      .then(task => {
        result.data = task;
        return sendAssignedTaskEmail(task);
      });
  }
};
```

Now, if there is ever a change to what should happen when a task is assigned, this modification happens is one place, and this change is not mixed in with myriad other concerns lurking inside a single `PUT` function.

All reasonably complex applications eventually move toward event-driven programming. Why? It's just plain cleaner. It keeps actions isolated. As complexity increases, keeping actions isolated becomes a much more significant priority.

Separation of concerns for the win!
