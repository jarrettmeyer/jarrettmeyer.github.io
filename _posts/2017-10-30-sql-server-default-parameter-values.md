---
title:    "SQL Server Default Parameter Values"
date:     2017-10-30
layout:   post
---

SQL Server stored procedure parameters can have default values. But did you know that both input and output parameters can have these defaults? Consider the following procedure:

```sql
create procedure [dbo].[InsertPerson]
  @firstName varchar(50) = null,
  @middleName varchar(50) = null,
  @lastName varchar(50) = null,
  @ssn varchar(10) = null
as
begin
  begin transaction;
  
  insert into dbo.Person (
    FirstName, MiddleName, LastName, SSN
  ) values 
    @firstName, @middleName, @lastName, @ssn
  );
  
  select * from dbo.Person where PersonKey = scope_identity();
  
  commit transaction;
end
```

Later, suppose we need to return the primary key of the newly created row. Maybe a new process cares about that new value. But we don't want to break everything else that calls this procedure. We can add a new line for `@personKey int = null output`, creating an output parameter with a default value.

```sql
create procedure [dbo].[InsertPerson]
  @firstName varchar(50) = null,
  @middleName varchar(50) = null,
  @lastName varchar(50) = null,
  @ssn varchar(10) = null,
  @personKey int = null output
as
begin
  begin transaction;
  
  insert into dbo.Person (
    FirstName, MiddleName, LastName, SSN
  ) values 
    @firstName, @middleName, @lastName, @ssn
  );
  
  set @personKey = scope_identity();
  
  select * from dbo.Person where PersonKey = @personKey;
  
  commit transaction;
end
```

That's it! Just two new lines (plus one small change) and nothing breaks.
