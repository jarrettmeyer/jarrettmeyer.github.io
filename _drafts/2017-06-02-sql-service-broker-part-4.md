---
title:   "SQL Service Broker Part 4: Request/Reply"
layout:  post
date:    2017-06-02
---

## Previous Posts

* [Part 1: Sending and Receiving Messages](/2017/05/25/sql-service-broker-part-1)
* [Part 2: Working with .NET](/2017/05/26/sql-service-broker-part-2)
* [Part 3: Activation](/2017/05/30/sql-service-broker-part-3)

So far we have covered sending and receiving messages, integrating messaging with .NET, and activation. In this post, we will show how to write Request/Reply operations.

## Creating the SQL Service Broker Objects

Instead of "request" and "reply" objects, SQL Server uses **initiator** and **target** objects. The idea is the same. Initiators begin dialogs and send first message. Targets receive the message, perform some type of operation, and send the reply back to the initiator. For this operation, we need two queues and two services. We are going to use the `[DEFAULT]` message type and `[DEFAULT]` contract. There is no reason to create additional objects for this example.

```sql
CREATE QUEUE [dbo].[MessageInitiatorQueue];
CREATE QUEUE [dbo].[MessageTargetQueue];
GO

CREATE SERVICE [//SBDemo/Message/MessageInitiatorService] ON QUEUE [dbo].[MessageInitiatorQueue] ( [DEFAULT] );
CREATE SERVICE [//SBDemo/Message/MessageTargetService] ON QUEUE [dbo].[MessageTargetQueue] ( [DEFAULT] );
GO
```

## Creating the Helper Objects

Let's start by creating some helper functions. All of these appear in a `BrokerUtil` course. We will start with beginning a dialog. To open a dialog, we need to know the two services involved and what contract we are using. If we were using multiple servers, we would also need to know what encryption scheme we were using.

```csharp
public static Guid BeginDialog(SqlConnection connection, SqlTransaction transaction, string fromService, string toService, string contract)
{
  using (var command = connection.CreateCommand())
  {
    // Set the command text to begin a dialog.
    command.CommandText = $"BEGIN DIALOG @handle FROM SERVICE {fromService} TO SERVICE {toService} ON CONTRACT {contract} WITH ENCRYPTION = OFF";
    command.Transaction = transaction;

    // Set the @handle parameter.
    var handleParam = command.CreateParameter();
    handleParam.ParameterName = "@handle";
    handleParam.SqlDbType = SqlDbType.UniqueIdentifier;
    handleParam.Direction = ParameterDirection.Output;
    command.Parameters.Add(handleParam);

    // Execute the query.
    command.ExecuteNonQuery();

    // Get the value of the parameter.
    var handle = (Guid)handleParam.Value;
    return handle;
  }
}
```

Next, we need to be able to send conversations. To send a message, we need the conversation handle, the type of message we're sending, and the serialized byte array.

```csharp
public static void Send(SqlConnection connection, SqlTransaction transaction, Guid handle, string messageTypeName, byte[] bytes)
{
  using (var command = connection.CreateCommand())
  {
    // Create the SQL command to send a message.
    command.CommandText = $"SEND ON CONVERSATION @handle MESSAGE TYPE {messageTypeName} ( @messageBody )";
    command.Transaction = transaction;

    // Set the @handle parameter.
    var handleParam = command.CreateParameter();
    handleParam.ParameterName = "@handle";
    handleParam.SqlDbType = SqlDbType.UniqueIdentifier;
    handleParam.Value = handle;
    command.Parameters.Add(handleParam);

    // Set the @messageBody parameter.
    var messageBodyParam = command.CreateParameter();
    messageBodyParam.ParameterName = "@messageBody";
    messageBodyParam.SqlDbType = SqlDbType.VarBinary;
    messageBodyParam.Value = bytes;
    command.Parameters.Add(messageBodyParam);

    // Execute the SQL command.
    command.ExecuteNonQuery();
  }
}
```

After sending messages, we need to be able to receive messages.

```csharp
public static Tuple<Guid, byte[]> GetMessage(SqlConnection connection, SqlTransaction transaction, string queueName, TimeSpan timeout)
{
  using (var command = connection.CreateCommand())
  {
    // Create the command text for receiving a message.
    command.CommandText = $"WAITFOR ( RECEIVE TOP(1) [conversation_handle], [message_body], [message_type_name], [service_contract_name], [service_name] FROM {queueName} ), TIMEOUT {timeout.TotalMilliseconds}";
    command.Transaction = transaction;

    // Create a data reader.
    using (var reader = command.ExecuteReader())
    {
      if (reader != null && reader.HasRows)
      {
        // Get the values from the DataReader.
        reader.Read();
        var conversationHandle = reader.GetSqlGuid(reader.GetOrdinal("conversation_handle")).Value;
        var messageBody = reader.GetSqlBinary(reader.GetOrdinal("message_body")).Value;
        var messageTypeName = reader.GetSqlString(reader.GetOrdinal("message_type_name")).Value;

        switch (messageTypeName)
        {
          case "http://schemas.microsoft.com/SQL/ServiceBroker/EndDialog":
            EndConversation(connection, transaction, conversationHandle);
            return new Tuple<Guid, byte[]>(Guid.Empty, null);
          case "http://schemas.microsoft.com/SQL/ServiceBroker/Error":
            var messageAsString = Deserialize<string>(messageBody);
            EventLog.WriteEntry("Application", messageAsString, EventLogEntryType.Error);
            EndConversation(connection, transaction, conversationHandle);
            return new Tuple<Guid, byte[]>(Guid.Empty, null);
          default:
            return new Tuple<Guid, byte[]>(conversationHandle, messageBody);
        }
      }
      else
      {
        // No rows returned.
        return new Tuple<Guid, byte[]>(Guid.Empty, null);
      }
    }
  }
}
```

Finally, we need to be able to end a conversation. To do this, we need the conversation handle.

```csharp
public static void EndConversation(SqlConnection connection, SqlTransaction transaction, Guid handle)
{
  using (var command = connection.CreateCommand())
  {
    // Create the command.
    command.CommandText = "END CONVERSATION @handle";
    command.Transaction = transaction;

    // Set the @handle parameter.
    var handleParam = command.CreateParameter();
    handleParam.ParameterName = "@handle";
    handleParam.SqlDbType = SqlDbType.UniqueIdentifier;
    handleParam.Value = handle;
    command.Parameters.Add(handleParam);

    // Execute the query.
    command.ExecuteNonQuery();
  }
}
```

## Object Serialization and Deserialization

Since we are writing our object to a queue, we are going to need to serialize our objects to and from binary. Fortunately, .NET Framework makes this very easy for us. We can use a `BinaryFormatter` and a memory stream to serialize an object.

```csharp
public static byte[] Serialize(object obj)
{
  using (var stream = new MemoryStream())
  {
    var formatter = new BinaryFormatter();
    formatter.Serialize(stream, obj);
    stream.Flush();
    return stream.ToArray();
  }
}
```

Anything that needs serialized needs to be deserialized.

```csharp
public static object Deserialize(byte[] bytes)
{
  if (bytes != null && bytes.LongLength > 0)
  {
    using (var stream = new MemoryStream(bytes))
    {
      var formatter = new BinaryFormatter();
      return formatter.Deserialize(stream);
    }
  }
  else
  {
    return null;
  }
}


public static T Deserialize<T>(byte[] bytes)
{
  var obj = Deserialize(bytes);
  if (obj != null)
  {
    return (T)obj;
  }
  return default(T);
}
```

## Creating the Initiator

The initiator is responsible for starting the conversation.

```csharp

```
