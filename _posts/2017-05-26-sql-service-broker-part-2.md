---
title: "SQL Service Broker Part 2: Working with .NET"
layout: post
date: 2017-05-26
description:
thumbnail: /assets/images/sql-server-logo.png
---

This is a continuation of a series on [SQL Service Broker]().

In [Part 1](/2017/05/25/sql-service-broker-part-1), we covered the basic mechanics of sending and receiving a message. In **Part 2**, we will cover writing and consuming messages with the .NET framework. This will build on the message types, contracts, queues, services, and stored procedures that we created in Part 1. If you haven't read that, I recommend that you do so.

Reading and writing with .NET is a fairly simple task. Let's take a look at how to do this. First, we will start a background thread to listen for received messages. Second, we will allow a simple text entry for a user to send messages.

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
  public class Program
  {
    public static Thread BackgroundThread = null;
    public const string ConnectionString = "Data Source=localhost;Initial Catalog=SBDemo;Integrated Security=True";
    public static bool Done = false;
    public const string ReceiveStoredProcedureName = "[dbo].[Receive_Hello_Message]";
    public const string SendStoredProcedureName = "[dbo].[Send_Hello_Message]";

    public static void Main(string[] args)
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

As promised, this was fairly simple. We start a background thread to receive the messages, and we have a simple console window to write messages. When the user types 'quit', the program stops.

We are missing two pieces of functionality. We still require the `ReceiveMessages` and `SendMessage` functions. We will start with `SendMessage`, since it will be the easier of the two.

```csharp
public static void SendMessage(string text)
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
| :------------------ | :--------------------- | :---------------------------- |
| 144E01D5-9441-E7... | //sbdemo/Hello/Message | This is my message from .NET! |

Receiving the message is very much the same process, but we have a little bit of extra work to do.

```csharp
public static void ReceiveMessages()
{
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

          conn.Open();
          command.ExecuteNonQuery();
          var text = command.Parameters["text"].Value as string;
          conn.Close();
          scope.Complete();

          if (text != null)
          {
            MessageBox.Show(text, "Message Received", MessageBoxButtons.OK, MessageBoxIcon.Information);
          }
        }
      }
    }
  }
}
```

There's a lot more going on in the receiver. Let's break it down. First, we open up a `TransactionScope`, `SqlConnection`, and `SqlCommand`. These are going to be our primary objects for receiving a message from a queue. Second, we remember that the `text` variable in our stored procedure is marked at `OUT`, so we need to designate that as such in our code. Third, close the connection and complete the scope. Finally, display a message box containing the message.

And that's it! We can now write .NET programs (or any programs that can call stored procedures) to work with our queues.
