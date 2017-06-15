---
title:    "Writing an SSIS Custom Task"
layout:   post
date:     2017-06-15
---

Spend enough time with SQL Server Integration Services (SSIS) and you will probably find yourself needing to write a reusable custom task. The existing [Script Task](https://docs.microsoft.com/en-us/sql/integration-services/control-flow/script-task) allows you to write C#, but script tasks are not repeatable from one project or integration to the next. *Copy/paste is not a design pattern.*

Here, we'll show a very simple example. One of the first issues that I ran into with SSIS is creating timestamp-based directories for moving files around. Yes, this is possible out of the box, but it also seems to be quite clumsy.

To do this the traditional way, create two variables in SSIS. We will call them `Timestamp` and `SanitizedTimestamp`. Define them as follows.

```
@[User::Timestamp] = (DT_WSTR, 30) (DT_DBTIMESTAMP) GETUTCDATE()
@[User::SanitizedTimestamp] = REPLACE(REPLACE(REPLACE(REPLACE(LEFT(@[User::Timestamp], 23), ":", ""), ".", ""), "-", ""), " ", "")
```

Can you see why I think this is so ugly? Do we really need four `REPLACE` functions? *Is supporting a regular expression replace really so difficult?*

Instead, I would much rather just drop a task onto my workflow.

![Generate Timestamp Task in SSIS](/assets/images/generate_timestamp_task.png)

To get to this step means writing a custom SSIS task. This is what the basic structure of the task looks like.

```csharp
[DtsTask(DisplayName = "Generate Timestamp", Description = "Generates a timestamp", IconResource = "Fusion.SSIS.Tasks.Resources.stopwatch.ico")]
public class GenerateTimestampTask : Task
{
  private const string DEFAULT_FORMAT_SPECIFIER = "yyyyMMddHHmmssffffff";

  public GenerateTimestampTask()
  {
    FormatSpecifier = DEFAULT_FORMAT_SPECIFIER;
  }

  [Category("Generate Timestamp"), DisplayName("Format Specifier")]
  public string FormatSpecifier { get; set; }

  [Category("Generate Timestamp"), DisplayName("Use UTC")]
  public string UseUTC { get; set; }

  [Category("Generate Timestamp"), DisplayName("Result Variable")]
  public string ResultVariable { get; set; }
}
```

This sets up the basic structure of our task, and it exposes any variables that the user will need to set. At this time, we have not written a custom UI for the task, but variables may still be edited in the Properties window. The `FormatSpecifier` indicates the output format of the timestamp. `UseUTC` will allow the user to create either a UTC or local timestamp. Finally, `ResultVariable` will be where the task writes the result.

![Generate Timestamp Properties Window](/assets/images/generate_timestamp_properties_window.png)

Before our task runs, we want to validate our user inputs. We must have a `FormatSpecifier` and a `ResultVariable`. Also, the `ResultVariable` must be a valid variable.

```csharp
public override DTSExecResult Validate(Connections connections, VariableDispenser variableDispenser, IDTSComponentEvents componentEvents, IDTSLogging log)
{
  if (string.IsNullOrEmpty(FormatSpecifier))
    return ValidationError(componentEvents, "Format specifier is required.");

  if (string.IsNullOrEmpty(ResultVariable))
    return ValidationError(componentEvents, "Result variable is required.");

  if (!variableDispenser.Contains(ResultVariable))
    return ValidationError(componentEvents, $"There is no variable named [{ResultVariable}].");

  return base.Validate(connections, variableDispenser, componentEvents, log);
}

private DTSExecResult ValidationError(IDTSComponentEvents componentEvents, string description)
{
  componentEvents.FireError(0, "Validate", description, "", 0);
  return DTSExecResult.Failure;
}
```

After our task successfully validates, it will be ready to execute. For this task, we must generate the timestamp, write the timestamp to the result variable, and return a success result. If there was any exception during the execution, log the error and return a failure result.

```csharp
public override DTSExecResult Execute(Connections connections, VariableDispenser variableDispenser, IDTSComponentEvents componentEvents, IDTSLogging log, object transaction)
{
  try
  {
    string timestamp = GenerateTimestamp(componentEvents);
    WriteToResultVariable(variableDispenser, timestamp);
    return DTSExecResult.Success;
  }
  catch (Exception ex)
  {
    string description = ex.Message + Environment.NewLine + ex.StackTrace;
    componentEvents.FireError(0, "Execute", description, "", 0);
    return DTSExecResult.Failure;
  }
}

private string GenerateTimestamp(IDTSComponentEvents componentEvents)
{
  DateTime now = UseUTC ? DateTime.UtcNow : DateTime.Now;
  string timestamp = now.ToString(FormatSpecifier);

  bool fireAgain = true;
  componentEvents.FireInformation(0, "Generate Timestamp", $"Timestamp = [{timestamp}].", "", 0, ref fireAgain);
  return timestamp;
}

private void WriteToResultVariable(VariableDispenser variableDispenser, string result)
{
  Variables variables = null;
  variableDispenser.LockForWrite(ResultVariable);
  variableDispenser.GetVariables(ref variables);
  var variable = variables.OfType<Variable>().FirstOrDefault(v => v.QualifiedName == ResultVariable);
  if (variable == null)
  {
    throw new Exception($"No such variable named [{ResultVariable}].");
  }
  variable.Value = result;
  variables.Unlock();
}
```

The only thing left to do is build and deploy our custom task. The assembly must be signed with a strong key and deployed to the GAC. The DLL also must be copied to the appropriate DTS folder for your machine. For me, this is `C:\Program Files (x86)\Microsoft SQL Server\140\DTS\Tasks`. This is the default location. If you changed the location of your SQL installation path, you may have a different DTS library path.

That is really all it takes to write a custom task. Don't let anyone tell you that it is excessively difficult.

The source code for this is available [on Github](https://github.com/fusionalliance/Fusion.SSIS).
