---
title:    "SQL Server Full Text Search Part 1: Getting Started"
layout:   post
date:     2017-06-09
---

SQL Server ships with integrated full text search capabilities. Setting up full text search is quite easy. To start, you need to make sure you have the feature installed. Fortunately, this is an easy process, handled like all other SQL Server installation operations. When setting up your instance, be sure to check the option "Full-Text and Semantic Extractions".

![Full text search installation](/assets/images/sql-server-full-text-install-1.png)

Next, let's create some objects.

```sql
CREATE DATABASE Search_Demo;
GO

USE Search_Demo;
GO

CREATE TABLE Authors (
  id INT NOT NULL,
  first_name NVARCHAR(255) NOT NULL,
  last_name NVARCHAR(255) NOT NULL,
  CONSTRAINT PK_Authors PRIMARY KEY CLUSTERED (id)
);
GO

CREATE TABLE Books (
  id INT NOT NULL,
  title NVARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  author_id INT NOT NULL,
  CONSTRAINT PK_Books PRIMARY KEY CLUSTERED (id),
  CONSTRAINT FK_Books_Authors FOREIGN KEY (author_id) REFERENCES Authors (id)
);
GO

INSERT INTO Authors (id, first_name, last_name) VALUES
  (100, 'Stephen', 'King'),
  (200, 'Leo', 'Tolstoy'),
  (300, 'Neil', 'Gaiman');

INSERT INTO Books (id, title, description, author_id) VALUES
  (100, 'It', 'This is a horror book.', 100),
  (200, 'The Monarch of Glen', 'A new book from the author of Coraline.', 300),
  (300, 'Anna Karenina', 'Anna Karenina became the basis of the musical "The King and I".', 200);
```

With traditional SQL, we can now search with `LIKE %` statements.

```sql
SELECT b.id, b.title, a.first_name, a.last_name
  FROM Books b
  INNER JOIN Authors a ON b.author_id = a.id
  WHERE b.title LIKE '%king%' OR
    b.description LIKE '%king%' OR
    a.first_name LIKE '%king%' OR
    a.last_name LIKE '%king%';
```

This returns the following (expected) results.

| id | title | first_name | last_name |
| :- | :---- | :--------- | :-------- |
| 100 | It | Stephen | King |
| 300 | Anna Karenina | Leo | Tolstoy |

The execution plan for this query is as follows.

![LIKE execution plan](/assets/images/sql-server-full-text-execution-plan-like.png)

## Building a Full-Text Catalog

Building a full text catalog, like many other tasks in SQL Server, is incredibly simple.

```sql
CREATE FULLTEXT CATALOG Book_Search AS DEFAULT;
```

We can then add our full text indexes to this database with `CREATE FULLTEXT INDEX` statements.

```sql
CREATE FULLTEXT INDEX ON Authors (
  first_name,
  last_name
) KEY INDEX PK_Authors;

CREATE FULLTEXT INDEX ON Books (
  title,
  description
) KEY INDEX PK_Books;
```

This changes our search query quite a bit. We can use the `CONTAINS` operator to search for a term.

```sql
SELECT b.id, b.title, a.first_name, a.last_name
  FROM Books b
  INNER JOIN Authors a ON b.author_id = a.id
  WHERE CONTAINS(a.first_name, 'king') OR
    CONTAINS(a.last_name, 'king') OR
    CONTAINS(b.title, 'king') OR
    CONTAINS(b.description, 'king');
```

This returns the exact same results as the table above, but now it is taking advantage of SQL Server's Full-Text Search feature. While this certainly works, this is not ideal. Using `LIKE %` requires full table scans.

![Search execution plan](/assets/images/sql-server-full-text-execution-plan-contains.png)

## Working with Synonyms (Thesaurus)

Full-Text Search can also work with similar words. You'll notice that one of our books is titled "The Monarch of Glen", and "monarch" is a synonym of "king". A search for "king" should return this book. The thesarus is saved in an XML file in the server instance's data directory. On my computer, I accepted all defaults, so that directory is `C:\Program Files\Microsoft SQL Server\MSSQL13.MSSQLSERVER\MSSQL\FTData\tsenu.xml`. The XML file is of the format `ts___.xml`, where the 3 characters are the language for the thesaurus.

To create a basic synonym, use the `<expansion>` node. All values listed as `<sub>` nodes will be considered interchangeable with each other during a search.

```xml
<XML ID="Microsoft Search Thesaurus">
  <thesaurus xmlns="x-schema:tsSchema.xml">
    <diacritics_sensitive>0</diacritics_sensitive>
    <expansion>
      <sub>king</sub>
      <sub>lord</sub>
      <sub>monarch</sub>
      <sub>sovereign</sub>
    </expansion>
  </thesaurus>
</XML>
```

To make use of these updates, Microsoft has provided us with a system stored procedure `sys.sp_fulltext_load_thesaurus_file`. To use this, we need to know the language code (`LCID`) of the language in question. You can find a full list of languages supported by SQL Server by querying `sys.syslanguages`.

```sql
DECLARE @lcid INT;
SELECT TOP (1) @lcid=[LCID] FROM sys.syslanguages WHERE [alias]='English'
EXEC sys.sp_fulltext_load_thesaurus_file @lcid;
```

As should be obvious, you will need a different synonym table for each language.

We also need to modify our search query to make use of the full-text capabilities of the search. To do this, we use the `FREETEXT` function.

```sql
SELECT b.id, b.title, a.first_name, a.last_name
  FROM Books b
  INNER JOIN Authors a ON b.author_id = a.id
  WHERE CONTAINS(a.first_name, 'king') OR
    CONTAINS(a.last_name, 'king') OR
    FREETEXT(b.title, 'king') OR
    FREETEXT(b.description, 'king');
```

Our query now returns the new result for "Then Monarch of Glen".

| id | title | first_name | last_name |
| :- | :---- | :--------- | :-------- |
| 100 | It | Stephen | King |
| 200 | The Monarch of Glen | Neil | Gaiman |
| 300 | Anna Karenina | Leo | Tolstoy |

The execution plan has not changed from before.

![Search execution plan](/assets/images/sql-server-full-text-execution-plan-freetext.png)
