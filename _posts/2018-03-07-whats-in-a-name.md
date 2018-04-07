---
title:    "What's in a Name?"
layout:   post
date:     2018-03-07
---

Names are easy, right? Every single one of us has - at one time or another - built a table that looks like this, right?

```sql
CREATE TABLE dbo.Persons (
  PersonKey INT NOT NULL IDENTITY(1, 1),
  FirstName NVARCHAR(100) NOT NULL,
  MiddleName NVARCHAR(100) NOT NULL,
  LastName NVARCHAR(100) NOT NULL,
  CONSTRAINT [PK_dbo.Persons] PRIMARY KEY CLUSTERED (PersonKey)
);
```

| PersonKey | FirstName | MiddleName | LastName |
| :-------- | :-------- | :--------- | :------- |
| 123       | Jonathan  | Q          | Public   |

We build our table like this because this is what we know. Sometimes old ways are old for a reason; sometimes old ways need to die.

Have you ever met someone who doesn't have a middle name? I have. What do you put there? Do you save a `null` value? Do you make it an empty string? What about suffixes? What about titles? Do those become more columns? Again, you have to deal with `null` values and empty strings. Is there a business-relevant difference between a `null` and an empty string?

What about tracking maiden names? What about name changes? What about people who have more than three names? Names are way more complicated than initially expected.

### You Don't Need It

Most of the time, I am willing to make a bet that you do not need that information. What is the difference between three columns and one? For most line of business applications, there is no difference at all. I believe you would be much better off with the following design.

```sql
CREATE TABLE dbo.Persons (
  PersonKey INT NOT NULL IDENTITY(1, 1),
  FullLegalName NVARCHAR(200) NOT NULL,
  DisplayName NVARCHAR(200) NOT NULL,
  CONSTRAINT [PK_dbo.Persons] PRIMARY KEY CLUSTERED (PersonKey)
);
```

This results in a data structure that is probably much closer to what you want.

| PersonKey | FullLegalName      | DisplayName |
| :-------- | :----------------- | :---------- |
| 123       | Jonathan Q. Public | Jonny Q.    |

You do not need last names in a separate column. If someone wants to be addressed as `Dr. Smith`, then store that as a column.

### Names with Variable Parts

If you have names of differing lengths, I recommend storing names in a name table.

```sql
CREATE TABLE dbo.Names (
  NameKey INT NOT NULL IDENTITY(1, 1),
  PersonKey INT NOT NULL,
  Sequence INT NOT NULL,
  NamePart NVARCHAR(100) NOT NULL,
  CONSTRAINT [PK_dbo.Names] PRIMARY KEY CLUSTERED (NameKey),
  CONSTRAINT [FK_dbo.Names_PersonKey] FOREIGN KEY (PersonKey) REFERENCES dbo.Persons (PersonKey)
);
```

| NameKey | PersonKey | Sequence | NamePart |
| :------ | :-------- | :------- | :------- |
| 501     | 123       | 1        | Jonathan |
| 502     | 123       | 2        | Q        |
| 503     | 123       | 3        | Public   |

### Naming the Variable Parts

We could also, just as easily, keep track of our different name parts. We have given names, middle names, family names, maiden names, religious names, nicknames,

```sql
CREATE TABLE dbo.NameTypes (
  NameTypeKey INT NOT NULL IDENTITY(1, 1),
  Description NVARCHAR(100) NOT NULL,
  CONSTRAINT [PK_dbo.NameTypes] PRIMARY KEY CLUSTERED (NameTypeKey)
);
```
| NameTypeKey | Description    |
| :---------- | :------------- |
| 1           | First Name     |
| 2           | Middle Name    |
| 3           | Last Name      |
| 4           | Nickname       |
| 5           | Title          |
| 6           | Suffix         |
| 7           | Religious Name |
| 8           | Credentials    |

Our `Names` table now looks like the following.

```sql
CREATE TABLE dbo.Names (
  NameKey INT NOT NULL IDENTITY(1, 1),
  PersonKey INT NOT NULL,
  Sequence INT NOT NULL,
  NameTypeKey INT NOT NULL,
  NamePart NVARCHAR(100) NOT NULL,
  CONSTRAINT [PK_dbo.Names] PRIMARY KEY CLUSTERED (NameKey),
  CONSTRAINT [FK_dbo.Names_PersonKey] FOREIGN KEY (PersonKey) REFERENCES dbo.Persons (PersonKey),
  CONSTRAINT [FK_dbo.Names_NameTypeKey] FOREIGN KEY (NameTypeKey) REFERENCES dbo.NameTypes (NameTypeKey)
);
```

| NameKey | PersonKey | Sequence | NameTypeKey | NamePart |
| :------ | :-------- | :------- | :---------- | :------- |
| 501     | 123       | 2        | 1           | Jonathan |
| 502     | 123       | 3        | 2           | Q        |
| 503     | 123       | 4        | 3           | Public   |
| 504     | 123       | 1        | 5           | Mr.      |
| 505     | 123       | 5        | 6           | III      |
| 506     | 123       | 6        | 7           | LMFT     |

I would also recommend that you add start and end dates to names, because names can change over time. Marriages happen and unhappen, and names can be legally changed.

| NameKey | PersonKey | Sequence | NameTypeKey | NamePart | StartDate   | EndDate     |
| :------ | :-------- | :------- | :---------- | :------- | :---------- | :---------- |
| 501     | 123       | 2        | 1           | Jonathan | 07-Mar-2018 | 31-Dec-9999 |
| 502     | 123       | 3        | 2           | Q        | 07-Mar-2018 | 31-Dec-9999 |
| 503     | 123       | 4        | 3           | Public   | 07-Mar-2018 | 31-Dec-9999 |
| 504     | 123       | 1        | 5           | Mr.      | 07-Mar-2018 | 31-Dec-9999 |
| 505     | 123       | 5        | 6           | III      | 07-Mar-2018 | 31-Dec-9999 |
| 506     | 123       | 6        | 7           | LMFT     | 07-Mar-2018 | 31-Dec-9999 |

Now, we have a name structure that works across languages and cultures; it allows for growth without adding more columns to a names table; it easily allows for tracking changes; it keeps like types of data in the same column; and it is a simple matter to create a name view, joining rows by `PersonKey`.
