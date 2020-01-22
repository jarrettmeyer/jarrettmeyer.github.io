---
title: "SQL Service Broker Part 3: Activation"
layout: post
date: 2017-05-30
description:
thumbnail: /assets/images/sql-server-logo.png
---

-   [Part 1: Sending and Receiving Messages](/2017/05/25/sql-service-broker-part-1)
-   [Part 2: Working with .NET](/2017/05/26/sql-service-broker-part-2)

## Service Activation

This post is third in a series on SQL Service Broker. In Part 1, we set up our service broker objects. In Part 2, we showed how we can integrate stored procedures with a .NET application. This application used a rudimentary loop structure to connect to the database and look for new messages.

```csharp
while (!Done)
{
  ReceiveMessages();
}
```

While this certainly works, we know this isn't the best way to write an application. We can improve this with [Service Broker Activation](<https://technet.microsoft.com/en-us/library/ms171617(v=sql.105).aspx>). Instead of a loop constantly pinging, our queue can kick off operations when new messages are received.

```sql
-- (1) Create a table to store our messages.
CREATE TABLE [dbo].[ArchivedMessages] (
  [id] BIGINT IDENTITY(1, 1) NOT NULL,
  [conversation_handle] UNIQUEIDENTIFIER NOT NULL,
  [text] NVARCHAR(MAX) NOT NULL,
  [created_at] DATETIME NOT NULL,
  CONSTRAINT [PK_ArchivedMessages] PRIMARY KEY CLUSTERED (
    [id] ASC
  )
)

-- (2) Create a stored procedure to handle messages.
CREATE PROCEDURE On_Hello_Message_Received
AS
BEGIN
  SET NOCOUNT ON;

  DECLARE @conversation_handle UNIQUEIDENTIFIER,
          @message_body VARBINARY(MAX),
          @message_type_name VARCHAR(256);

  BEGIN TRANSACTION;

    RECEIVE TOP(1)
      @conversation_handle = [conversation_handle],
      @message_body = [message_body],
      @message_type_name = [message_type_name]
    FROM [dbo].[Hello_Message_Queue];

    INSERT INTO [dbo].[ArchivedMessages]
      ([conversation_handle], [text], [created_at])
    VALUES
      (@conversation_handle, CONVERT(VARCHAR(MAX), @text), GETDATE());

  COMMIT TRANSACTION;
END

-- (3) Update our queue to include an activation rule.
ALTER QUEUE [dbo].[Hello_Message_Queue]
  WITH ACTIVATION (
    STATUS = ON,
    PROCEDURE_NAME = [dbo].[OnHelloMessageReceived],
    MAX_QUEUE_READERS = 10
  )
```

Let's review what we've done. We (1) created a table to archive our messages. _Yes, this is silly, but it gets the point across of what we're trying to accomplish._ We (2) created a stored procedure to do something with the queue message. Finally, we (3) updated our queue to use activation. When messages are received, the `[OnHelloMessageReceived]` stored procedure is going to be invoked.

Now that we have this feature available, we have lots of options as developers.

1. We can perform operations on the message from inside the stored procedure.
2. We can make direct updates to databases.
3. We can send replies from the stored procedure.
4. We can split a message to multiple queues.
5. We can call other programs, like .NET programs, from a stored procedure. This can be done with the [SQL Server Agent](https://www.mssqltips.com/sqlservertip/2014/replace-xpcmdshell-command-line-use-with-sql-server-agent/).

Basically, if you can do it in a stored procedure, then you can do it from a queue handler.
