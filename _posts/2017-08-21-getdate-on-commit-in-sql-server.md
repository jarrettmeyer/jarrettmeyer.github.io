---
title:    "GETDATE() on Commit in SQL Server"
layout:   post
date:     2017-08-21
---

Here's a fun little problem that a coworker and I ran into last week. We're creating
a database that isn't quite a data vault, but will have some *data-vault-like* properties.
Most of the data is coming from third-party services. Data that comes from third-parties
may not be edited; it is what is. We also wanted to be able to track data that gets
loaded somewhat together.

Most of our data tables have an `InsertedDate` column. We want everything that gets
loaded together to have the same value in this column. Our question was this: **If 
you wrap all of your operations in a transaction, will this set the timestamp at 
commit?**

Here's our simple test.

```sql
create table ThisIsJunk (
	InsertedDate datetimeoffset(7)
);

begin transaction;

declare @counter int = 0;
while @counter < 1000
begin
	insert into ThisIsJunk (InsertedDate) values (getutcdate());
	set @counter = @counter + 1;
end

commit transaction;

select min(InsertedDate) as minval, max(InsertedDate) as maxval from ThisIsJunk;
drop table ThisIsJunk;
```

Here's what we see for the output.

| minval                             | maxval                             |
| :--------------------------------- | :--------------------------------- |
| 2017-08-21 13:06:27.8900000 +00:00 | 2017-08-21 13:06:28.2966667 +00:00 |

Obviously, these values are **not** the same. If you want all of your `InsertedDate`
values to be the same, you must explicitly make a variable and save this variable.

```sql
create table ThisIsJunk (
	InsertedDate datetimeoffset(7)
);

begin transaction;

declare @counter int = 0;
declare @insertedDate datetimeoffset(7) = getutcdate();
while @counter < 1000
begin
	insert into ThisIsJunk (InsertedDate) values (@insertedDate);
	set @counter = @counter + 1;
end

commit transaction;

select min(InsertedDate) as minval, max(InsertedDate) as maxval from ThisIsJunk;
drop table ThisIsJunk;
```

This time, we get an expected, deterministic result for our timestamps.

| minval                             | maxval                             |
| :--------------------------------- | :--------------------------------- |
| 2017-08-21 13:09:54.0233333 +00:00 | 2017-08-21 13:09:54.0233333 +00:00 |

And now we know: we must explicitly set our `InsertedDate` if we want everything
that is inserted together to share the same timestamp. The `commit` will not take
care of this for us.
