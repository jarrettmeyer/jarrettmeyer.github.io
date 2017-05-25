---
title:   "SQL Service Broker: Part 1"
layout:  post
date:    2017-05-25
---

This is the first in a series of posts on working with [SQL Service Broker](https://docs.microsoft.com/en-us/sql/database-engine/configure-windows/sql-server-service-broker) for application messaging. In this post, we will cover the basics of setting up message, contracts, and queues. It is expected that you already know what queues are and why you would want to use them in your application.

The Service Broker consists of these primary parts.

1. **Message Type:** Indicates the types of objects we will be passing around our queues. Importantly, the message type indicates the type of validation that is performed on the message body. It can be `EMPTY` (message body must be `NULL`), `NONE` (no validation), `WELL_FORMED_XML`, or `VALID_XML` (requires a registered XML schema). For this example, we will be using the `NONE` validation, since we plan on having objects that are serialized by our external applications. Under the covers, Service Broker always converts the message body to a `VARBINARY(MAX)`. Any data that can be converted to `VARBINARY(MAX)` can be a message body.
2. **Contract:** The contract indicates who can send which message types and whether the message types are sent by an `INITIATOR`, `TARGET`, or `ANY`.
3. **Queue:** Queues store messages. You should plan on having a queue for each consumer. A queue can store multiple message types.
4. **Service:** A service exposes the functionality of contracts and queues.

The easiest way to see how all of this works together is to build a small message. Let's create the objects for our first service broker. This first example will be an incredibly simple, one-way, text message.

Message types, contracts, and services typically have URI-style names of the format **//<organization>/<domain>/<name>**. In this project, our oranization is **sbdemo** (service broker demo), and our domain is **Hello**.

Example message types would be named with the following format.

* `//corp/Expenses/SubmitExpense` - An employee submits expenses to his or her manager.
* `//corp/Expenses/AcceptExpense` - Expenses are accepted and sent to payroll for processing.
* `//corp/Expenses/RejectExpense` - Expense is rejected and sent back to the employee.
* `//corp/Expenses/AuthorizationRequired` - Expense amount exceeds manager's approval authority. Expense is routed to the next manager in the organization hierarchy.

```sql
-- Create a message type. This message will just be text, so there will be no validation.
CREATE MESSAGE TYPE [//sbdemo/Hello/Message]
  AUTHORIZATION [dbo]
  VALIDATION = NONE

-- Create a contract. We will allow messages of type //sbdemo/Hello/Message to be
-- sent. This is a simple, one-way example, so there are no other message types
-- associated with this contract.
CREATE CONTRACT [//sbdemo/Hello/MessageContract]
  AUTHORIZATION [dbo]
  ( [//sbdemo/Hello/Message] SENT BY INITIATOR )

-- Create a queue. This will store our messages. Queues follow traditional SQL naming
-- conventions.
CREATE QUEUE [dbo].[Hello_Message_Queue]

-- Create a service. A service with no queues cannot receive messages.
CREATE SERVICE [//sbdemo/Hello/MessageService]
  AUTHORIZATION [dbo]
  ON QUEUE [dbo].[Hello_Message_Queue] ( [//sbdemo/Hello/MessageContract] )
```

Next, we will create a stored procedure to send messages on this service. This is done with the [`SEND` command](http://docs.microsoft.com).

```sql
CREATE PROCEDURE [dbo].[Send_Hello_Message]
  @text NVARCHAR(MAX)
AS
BEGIN
  SET NOCOUNT ON;

  DECLARE @handle UNIQUEIDENTIFIER;

  BEGIN TRANSACTION
    BEGIN DIALOG @handle
      FROM SERVICE [//sbdemo/Hello/MessageService]
      TO SERVICE '//sbdemo/Hello/MessageService'
      ON CONTRACT [//sbdemo/Hello/MessageContract]
      WITH ENCRYPTION = OFF;

    SEND ON CONVERSATION @handle MESSAGE TYPE [//sbdemo/Hello/Message] ( @text );

  COMMIT TRANSACTION
END
```

The `FROM SERVICE` indicates where this dialog is starting, and the `TO SERVICE` tells us where the dialog is going to be written. You have the option to set an encryption scheme; however, this is running on a single server, and there is no need for encryption. If you are writing to different servers, you will probably want to use certificates to secure your data.

Let's invoke our `[Send_Hello_Message]` stored procedure.

```sql
EXEC [dbo].[SendMessage] @text = "Hello, World!"
```

We can query our queue and see our messages.

| conversation_handle | message_type_name      | message_body             |
| :------------------ | :----------------------| :----------------------- |
| 13D86229-5441-E7... | //sbdemo/Hello/Message | Hello, World!            |
| AEF3B54A-7E41-E7... | //sbdemo/Hello/Message | This is another message. |
| B6F3B54A-7E41-E7... | //sbdemo/Hello/Message | Wow! Messages are fun!   |

We can send and show our messages in queue. Each message has a GUID for conversation handle. If there are multiple messages as part of a single So our next task is being able to receive these messages. This is done with the [`RECEIVE` command](http://docs.microsoft.com). Next, we will create a stored procedure to receive messages.

```sql
CREATE PROCEDURE [dbo].[Receive_Hello_Message]
  @text NVARCHAR(MAX) OUT
AS
BEGIN
  SET NOCOUNT ON;

  DECLARE @conversation_handle UNIQUEIDENTIFIER,
          @message_body VARBINARY(MAX),
          @message_type_name VARCHAR(256)

  BEGIN TRANSACTION
    RECEIVE TOP (1)
        @conversation_handle = [conversation_handle],
        @message_body = [message_body],
        @message_type_name = [message_type_name]
      FROM [dbo].[Hello_Message_Queue]

    SET @text = CONVERT(NVARCHAR(MAX), @message_body)    
  COMMIT TRANSACTION
END
```

And that's it! We can now receive messages from the queue. This is the simplest possible queuing solution. This demo is certainly not the end-all-be-all of queuing and service brokers. In future posts, we will go through many of the other available features of the service broker.
