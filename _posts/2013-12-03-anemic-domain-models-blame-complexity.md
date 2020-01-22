---
layout: post
title: "Anemic Domain Models: Blame Complexity"
date: 2013-12-03
description:
thumbnail: /assets/images/model-airplane.png
---

This is a reply to Steve Wilkes' post on [I See Anemic Domain Models](http://geekswithblogs.net/mrsteve/archive/2013/11/30/anemicdomainmodel-anti-pattern-definition-description-problems-tips.aspx). I was going to write this as a reply, but then it got way too long.

I also dislike the [Anemic Domain Model](http://www.martinfowler.com/bliki/AnemicDomainModel.html) antipattern. I love the idea of nouns and verbs. Our models, or classes, are nouns. The actions those models can take, or verbs, become methods. You end up with a wonderful programming grammar.

### Keep it simple.

Let's start with a really simple domain model. We have a task. We can complete that task.

```csharp
public class Task
{
  public virtual int Id { get; set; }
  public virtual string Description { get; set; }
  public virtual DateTime CreatedAt { get; set; }
  public virtual DateTime? CompletedAt { get; set; }
  public virtual bool IsCompleted { get; set; }

  public virtual void Complete()
  {
    if (!IsCompleted)
    {
      IsCompleted = true;
      CompletedAt = DateTime.UtcNow;
    }
  }
}
```

The above it truly some beautiful code. I wish everything I worked on looked like that.

To use the above method, we will probably do something like this.

```csharp
using (var session = sessionFactory.OpenSession())
{
  using (var txn = session.BeginTransaction())
  {
    task = session.Load<Task>(id);
    task.Complete();
    txn.Commit();
  }
}
```

Wow! That was so easy!

### It doesn't always get better.

When an object is simple and well-defined, this is great. So let's make it a bit more complicated. What if instead of a simple `IsCompleted` flag, we now have user-defined statuses? Not only do we want to trak the current status of a task, we want to maintain a status history.

```sql
create table task_statuses (
  task_status_id int not null identity(1, 1),
  description varchar(256) not null,
  is_default bit not null,
  is_completed bit not null,
  trigger_emails bit not null,
  trigger_chart_regeneration bit not null,
  constraint [pk_task_statuses] primary key clustered ([task_status_id] asc)
);
```

We should also check that we're not setting a status twice. There's nothing completely awful if this happens, so there's no need for an exception, probably a race condition in the UI or something like that. However, we do want to know about it.

```csharp
public class Task
{
  public virtual TaskStatus CurrentStatus { get; set; }

  public virtual IList<StatusHistory> StatusHistories { get; set; }

  public virtual void SetStatus(TaskStatus newStatus)
  {
    if (this.CurrentStatus == newStatus)
    {
      log.Warn(string.Format("Attempting to set task {0} from status {1}:{2} to status {3}:{4}. Someone should really write a better UI to prevent this scenario from happening.", Id, CurrentStatus.Id, CurrentStatus.Description, newStatus.Id, newStatus.Description));
      return;
    }

    var statusHistory = new StatusHistory
    {
      Status = newStatus,
      AssignedTo = newStatus.AssignedTo,
      Task = this,
      CreatedAt = DateTime.UtcNow
    };
    this.StatusHistorys.Add(statusHistory);
    this.CurrentStatus = newStatus;
    this.AssignedTo = newStatus.AssignedTo;
    this.IsCompleted = newStatus.IsCompleted;
  }
}
```

While we're adding complexity, let's introduce a task workflow. You're only allowed to pass from certain statuses to other statuses given conditions stored in a database table. The simple version of this table would look something like the following.

```sql
create table status_workflows (
  status_workflow_id int not null identity(1, 1),
  from_status_id int not null,
  to_status_id int not null
  constraint [pk_status_workflows] primary key clustered ([status_workflow_id] asc)
);
```

Our method signature would need to change to include these workflows. The

```csharp
public virtual void SetStatus(Status newStatus, IEnumerable<StatusWorkflow> statusWorkflows)
{
  bool isAllowedWorkflow = statusWorkflows
     .Any(sw => sw.FromStatus == this.CurrentStatus && sw.ToStatus == newStatus);

  if (!isAllowedWorkflow)
  {
    // We've written a custom ApplicationException to handle this scenario.
    throw new InvalidWorkflowTransitionException(CurrentStatus, newStatus);
  }

  // etc.
}
```

This method is public, so we should probably take care of some null checks. FxCop is going to warn about that.

```csharp
public virtual void SetStatus(Status newStatus, IEnumerable<StatusWorkflow> statusWorkflows)
{
  if (newStatus == null) throw new ArgumentNullException("newStatus");
  if (statusWorkflows == null) throw new ArgumentNullException("statusWorkflows");

  // etc.
}
```

What if we also need to trigger emails? We know better than to create a new `SmtpClient` instance in our class because that's not going to be unit-testable. That means that we need to create a wrapper class for `SmtpClient` and pass in the adapter via method injection.

```csharp
public virtual void SetStatus(
    Status newStatus,
    IEnumerable<StatusWorkflow> statusWorkfows,
    ISmtpAdapter smtpAdapter)
{
  // etc.

  // Fetch the correct email template from ???
  Template mailTemplate = ...;

  // Set the task for mail template.
  mailTemplate.Task = this;

  // Create a new email message and send it.
  string mailBody = template.TransformText();
  MailMessage mailMessage = ...;
  smtpAdapter.Send(mailMessage);
}
```

Oh, we also have burndown chart regeneration. It turns out, I need to know a lot more info from the database to regenerate that burndown chart. Now I'm passing around my database session.

```csharp
public virtual void SetStatus(
    Status newStatus,
    IEnumerable<StatusWorkflow> statusWorkfows,
    ISmtpAdapter smtpAdapter,
    IBurndownChartGenerator burndownChartGenerator,
    ISession session)
{
  // Really?
}
```

As you see, as our application complexity grows, our method continues to add more and more parameters, and our method grows longer.

### This is why double dispatch exists.

Screw it. This is getting way too complicated for a domain model. Let's just go with what we learned from Eric Evans in [Domain Driven Design](http://www.amazon.com/Domain-Driven-Design-Tackling-Complexity-Software/dp/0321125215/) instead. We'll just use the double dispatch pattern.

```csharp
public virtual void SetStatus(Status newStatus, IStatusSetter statusSetter)
{
  statusSetter.SetNewStatus(this, newStatus);
}
```

Wow! We have finally cleaned up that code! It looks a lot better now. And I didn't even get into assigning a task to a user. (Is the user active? Is the user on this project? Can the user be assigned tasks with this task type? Are you doing any type of capacity planning?)

But now what's the point of the `SetStatus()` method? All the work is now being done by our `IStatusSetter` logical service. Let's look at the next two pieces of code that do the exact same thing.

```csharp
// Version 1:
IStatusSetter statusSetter = ServiceLocator.Instance.GetService<IStatusSetter>();
ISession session = ServiceLocator.Instance.GetService<ISession>();
using (var txn = session.OpenTransaction())
{
  task = session.Load<Task>(id);
  nextStatus = session.Load<TaskStatus>(nextStatusId);
  task.SetStatus(nextStatus, statusSetter);
  txn.Commit();
}

// Version 2:
IStatusSetter statusSetter = ServiceLocator.Instance.GetService<IStatusSetter>();
ISession session = ServiceLocator.Instance.GetService<ISession>();
using (var txn = session.OpenTransaction())
{
  task = session.Load<Task>(id);
  nextStatus = session.Load<TaskStatus>(nextStatusId);
  // We skip the double dispatch and just call SetNewStatus directly.
  statusSetter.SetNewStatus(task, nextStatus);
  txn.Commit();
}
```

I write services because our models are complicated. I never get the simple music library, blog, or to-do list apps to work on any longer. This leads to the **Single Responsibility Principle**. If any class is handling both setting statuses and assigning tasks and sending emails and updating burndown charts, I'm instantly going to ask, "Who threw up all over this code?" That is plainly too much going on inside one class.

Honestly, service methods are just better ways of handling this kind of stuff. What would you rather see in your `Task` object? All of that stuff up there or none of it?

### ActiveRecord is too busy by default.

If you're used to using Rail's [ActiveRecord](http://guides.rubyonrails.org/active_record_basics.html), I'm going to stake this claim right away: **ActiveRecord has enough going on already**. Please, do not add business logic to your ActiveRecord models. Between the finders and validators, these classes already have enough going on. Adding any business logic to them just makes them even more complicated.

This is an ActiveRecord object that has only minimal logic for validations and a few custom finders. I even tried to keep this class small by using helpers and concerns where I could.

```ruby
require 'textacular/searchable'

class Episode < ActiveRecord::Base

  include ActiveModel::ForbiddenAttributesProtection
  include EpisodeValidations
  include NewEpisodeBehavior
  include MarkdownBehavior

  # Add support for PG full text search
  extend Searchable(:title, :summary_markdown, :content_markdown)

  # Active record relations.
  has_and_belongs_to_many :tags

  # Named scopes.
  scope :free_to_view, lambda { with_tag('free') }
  scope :published, lambda { where('status = ? and published_on <= ?', 'published', Date.today) }
  scope :order_by_published_on, lambda { order('published_on desc') }
  scope :with_tag, lambda { |slug| joins(:tags).where('tags.slug = ?', slug) }

  # Callbacks
  before_validation :ensure_video_path_leading_slash, :render_html

  def free_to_view?
    self.tags.collect(&:slug).include?('free')
  end

  def published?
    self.published_on <= Date.today && self.status == 'published'
  end

  def to_param
    self.slug
  end

  private

    def ensure_video_path_leading_slash
      if self.video_path
        self.video_path = '/' + self.video_path unless self.video_path[0] == '/'
      end
    end

    def render_html
      self.content_html = markdown(self.content_markdown)
      self.summary_html = markdown(self.summary_markdown)
    end

end
```

We still end up with 50 lines of code, and this class doesn't even perform any real business logic.

### Let's start drawing some lines.

Not all software is easy. But that doesn't mean it's going to be difficult.

> Your service classes should **NOT** be static.

There's a big difference in testability between the following lines of code...

```csharp
ITaskCompletionService taskCompletionService = ...; // get the service
taskCompletionService.CompleteTask(123);
```

...and this...

```csharp
TaskCompletionService.CompleteTask(123);
```

The latter version is nearly impossible to test the myriad scenarios that you may encounter. Also, it means that everything that is used by `TaskCompletionService` is also going to be a static reference. That means that those are going to be nearly impossible to test, as well.

> Your data model is not your domain model is not your view model.

It doesn't take very much complication before we run into a scenario where what we store in the database is not the same as the object that we manipulate in code. Frequently, this business object isn't what I want to show the user.

```csharp
public class EmployeeDataRow
{
  // This is what the employee record looks like when serialized
  // in our database.

  public int EmployeeId { get; set;}
  public string SSN { get; set; }
  public string FirstName { get; set; }
  public string LastName { get; set; }
  public IDictionary<string, string> Properties { get; set; }
}

public class Employee
{
  // This is our domain model that we work with in our
  // code. We have created an actual SSN type.

  private readonly EmployeeDataRow data;

  public Employee()
    : this(new EmployeeDataRow())
  {
  }

  public Employee(EmployeeDataRow data)
  {
    this.data = data;
  }

  public int EmployeeId { get; set; }
  public SSN SSN
  {
    get { return new SSN(data.SSN); }
    set { data.SSN = value.ToString(); }
  }
  public string FirstName { get; set; }
  public string LastName { get; set; }
  public MailAddress WorkEmail
  {
    get { return GetPropertyValue<MailAddress>("work_email"); }
    set { SetPropertyValue("work_email", value); }
  }
  public DateTime DateOfHire
  {
    get { return GetPropertyValue<DateTime>("date_of_hire"); }
    set { SetPropertyValue("date_of_hire", value); }
  }

  // etc. with more properties...
}

public class EmployeeViewModel
{
  // This is what we'd actually display to users, which probably
  // won't be the same as what we store in the database or the
  // domain model that we actually work with in code.
  //
  // SSN will be a string masked as XXX-XX-1234.
  //
  // Date of hire will be a string formatted as dd-mmm-yyyy.
  //
  // Work email will only show the part before the '@'.
  //
  // Salary estimate needs to be computed for hourly employees, based on
  // 40 hrs per week, 48 weeks per year.
}
```

Yes, these object are all very similar. However, what we store, what we work with, and what we display to users is **not** the same object.

We also need to realize that the objects that we work with (our domain models) can have a lot more layers to them than our data objects will. For example when a user shows up to your web site that user is a `Guest`. Once they log in, that person is a `User`. You might even distinguish between a `FreeUser` and a `Subscriber`. Yes, all of these objects will be serialized to a `users` table. However, it should be clear that different types of users would have different methods available to them.

### Conclusion.

There are reasons that domain models end up anemic. Our rules are complex. Our classes are too big. If I store everything that a `Task` can do, that will be a plain and clear violation of the Single Resonsibility Principle. Writing software is about making choices. I would much rather have clear domain service that does one thing than have one `Task` class with too many built-in features.
