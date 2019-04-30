---
title:  "Power BI: Dates Table"
layout: post
date:   2019-04-26
tags:   powerbi
---

Creating a dates table is a universal problem when working with data analysis tools. Here's a quick solution to this eternal problem.

### Create a Parameter for the Start Date

Name this value `StartDateParameter`. Set this value to 01-Jan-1900.

```m
#date(1900, 1, 1) meta [IsParameterQuery=true, Type="Date", IsParameterQueryRequired=true]
```

### Create a Parameter for the End Date

Name this value `EndDateParameter`. Set this value to 31-Dec-2999.

```m
#date(2999, 12, 31) meta [IsParameterQuery=true, Type="Date", IsParameterQueryRequired=true]
```

### Create a Parameter for Duration

Name this value `DurationParameter`. Set the value to 1 day.

```m
#duration(1, 0, 0, 0) meta [IsParameterQuery=true, Type="Duration", IsParameterQueryRequired=true]
```

### Create a Data Set for `Dates`

Create a new Blank Query. Open the Advanced Editor and paste in the following text. As you can see, we use `StartDateParameter` and `EndDateParameter` to set the bounds for our `Dates` data set. We use `DurationParameter` to create the list of dates.

```m
let
    DayCount = Duration.Days(Duration.From(EndDateParameter - StartDateParameter)),
    Source = List.Dates(StartDateParameter, DayCount, DurationParameter),
    TableFromList = Table.FromList(Source, Splitter.SplitByNothing()),
    RenameColumn1 = Table.RenameColumns(TableFromList, { {"Column1", "Date"} }),
    ChangeDateType = Table.TransformColumnTypes(RenameColumn1, { {"Date", Date.Type} }),
    AddYear = Table.AddColumn(ChangeDateType, "Year", each Date.Year([Date]), Int32.Type),
    AddMonth = Table.AddColumn(AddYear, "Month", each Date.Month([Date]), Int32.Type),
    AddDay = Table.AddColumn(AddMonth, "Day", each Date.Day([Date]), Int32.Type),
    AddDayOfWeek = Table.AddColumn(AddDay, "DayOfWeek", each Date.DayOfWeek([Date]), Int32.Type),
    AddWeekday = Table.AddColumn(AddDayOfWeek, "Weekday", each Date.DayOfWeekName([Date]), Text.Type),
    AddMonthName = Table.AddColumn(AddWeekday, "MonthName", each Date.MonthName([Date]), Text.Type),
    AddShortWeekday = Table.AddColumn(AddMonthName, "ShortWeekday", each Text.Start([Weekday], 3), Text.Type),
    AddShortMonthName = Table.AddColumn(AddShortWeekday, "ShortMonthName", each Text.Start([MonthName], 3), Text.Type),
    AddStartOfMonth = Table.AddColumn(AddShortMonthName, "StartOfMonth", each Date.StartOfMonth([Date]), Date.Type),
    AddEndOfMonth = Table.AddColumn(AddStartOfMonth, "EndOfMonth", each Date.EndOfMonth([Date]), Date.Type),
    AddDaysInMonth = Table.AddColumn(AddEndOfMonth, "DaysInMonth", each Date.DaysInMonth([Date]), Int32.Type),
    AddDayOfYear = Table.AddColumn(AddDaysInMonth, "DayOfYear", each Date.DayOfYear([Date]), Int32.Type),
    AddIsLeapYear = Table.AddColumn(AddDayOfYear, "IsLeapYear", each Date.IsLeapYear([Date]), Logical.Type),
    AddDaysInYear = Table.AddColumn(AddIsLeapYear, "DaysInYear", each if [IsLeapYear] then 366 else 365),
    AddQuarter = Table.AddColumn(AddDaysInYear, "Quarter", each Date.QuarterOfYear([Date]), Int32.Type),
    AddMM = Table.AddColumn(AddQuarter, "MM", each Text.End("0"&Text.From([Month]), 2), Text.Type),
    AddDD = Table.AddColumn(AddMM, "DD", each Text.End("0"&Text.From([Day]), 2), Text.Type),
    AddDDD = Table.AddColumn(AddDD, "DDD", each Text.End("00"&Text.From([DayOfYear]), 3)),
    AddMMDDYYYY = Table.AddColumn(AddDDD, "MM.DD.YYYY", each [MM]&"/"&[DD]&"/"&Text.From([Year])),
    AddDDMMYYYY = Table.AddColumn(AddMMDDYYYY, "DD.MM.YYYY", each [DD]&"/"&[MM]&"/"&Text.From([Year]), Text.Type),
    AddYYYYDDD = Table.AddColumn(AddMMDDYYYY, "YYYY.DDD", each Text.From([Year])&"/"&[DDD], Text.Type),
    AddYYYYQ = Table.AddColumn(AddYYYYDDD, "YYYY.Q", each Text.From([Year])&"/"&Text.From([Quarter]), Text.Type),
    SortTable = Table.Sort(AddYYYYQ, {"Year", "Month", "Day"})
in
    SortTable
```

That's it! Apply the changes to your model. You now have a table of dates for your next Power BI project.
