---
title:   "SQL Service Broker: Part 2"
layout:  post
date:    2017-05-26
---

This is a continuation of a series on [SQL Service Broker]().

In [Part 1](/2017/05/25/sql-service-broker-part-1), we covered the basic mechanics of sending and receiving a message. In **Part 2**, we will cover writing and consuming messages with the .NET framework. This will build on the message types, contracts, queues, services, and stored procedures that we created in Part 1.

This is a fairly simple task. Let's take a look at how to do this. First, we will start a background thread to listen for received messages. Second, we will allow a simple text entry for a user to send messages.

```csharp
using System;
using System.Data;
using System.Data.SqlClient;
using System.Diagnostics;
using System.Threading;
using System.Transactions;
using System.Windows.Forms;

namespace ServiceBrokerDemo
{
  static Thread BackgroundThread = null;
  const string ConnectionString = "Data Source=localhost;Initial Catalog=SBDemo;Integrated Security=True";
  static bool Done = false;
  const string ReceiveStoredProcedureName = "[dbo].[Receive_Hello_Message]";
  const string SendStoredProcedureName = "[dbo].[Send_Hello_Message]";

  class Program
  {
    static void Main(string[] args)
    {
      var ts = new TheadStart(ReceiveMessages);
      BackgroundThread = new Thread(ts);
      BackgroundThread.Start();

      while (!Done)
      {
        Console.Write("Please type your message (type 'quit' when done): ");
        var text = Console.ReadLine();

        if (text.toLower() == 'quit')
        {
          Done = true;
          break;
        }

        SendMessage(text);
      }
    }
  }
}
```

As promised, this was fairly simple. We are missing two pieces of functionality. We still require the `ReceiveMessages` and `SendMessage` functions. We will start with `SendMessage`, since it will be the easier of the two.

```csharp
public void SendMessage(string text)
{
  using (var conn = new SqlConnection(ConnectionString))
  {
    using (var command = conn.CreateCommand())
    {
      command.CommandText = SendStoredProcedureName;
      command.CommandType = CommandType.StoredProcedure;
      command.Parameters.Add("text", SqlDbType.NVarChar, -1);
      command.Parameters["text"].Value = text;

      conn.Open();
      command.ExecuteNonQuery();
      conn.Close();
    }
  }
}
```

The `SendMessage` function invokes the stored procedure that we have already written in our database. If we query the queue, we can see the message waiting for delivery.

| conversation_handle | message_type_name      | message_body                  |
| :------------------ | :----------------------| :---------------------------- |
| 144E01D5-9441-E7... | //sbdemo/Hello/Message | This is my message from .NET! |

Receiving the message is very much the same process, but we have a little bit of extra work to do.

```csharp
public void ReceiveMessages()
{
  var lastErrorTime = DateTime.Now;
  var lastErrorMessage = "";

  while (!Done)
  {
    using (var scope = new TransactionScope())
    {
      using (var conn = new SqlConnection(ConnectionString))
      {
        using (var command = conn.CreateCommand())
        {
          command.CommandText = ReceiveStoredProcedureName;
          command.CommandType = CommandType.StoredProcedure;
          command.Parameters.Add("text", SqlDbType.NVarChar, -1);
          command.Parameters["text"].Direction = ParameterDirection.Output;

          try
          {
            conn.Open();
            command.ExecuteNonQuery();
            var text = command.Parameters["text"].Value as string;
            conn.Close();
            if (text != null)
            {
              MessageBox.Show(text, "Message Received", MessageBoxButtons.OK, MessageBoxIcon.Information);
            }
          }
          catch (ThreadAbortException)
          {
            BackgroundThread.Abort();
          }
          catch (Exception ex)
          {
            var elapsedSinceLastError = DateTime.Now - lastErrorTime;
            if (ex.Message != lastErrorMessage || elapsedSinceLastError.Minutes > 1)
            {
              EventLog.WriteEntry("Application", ex.Message, EventLogEntryType.Error);
              lastErrorTime = DateTime.Now;
            }
            else if (ex.Message == lastErrorMessage)
            {
              Thread.Sleep(TimeSpan.FromSeconds(10));
            }
            lastErrorMessage = ex.Message;
          }
          finally
          {
            scope.Complete();
          }
        }
      }
    }
  }
}
```
