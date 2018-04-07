---
title:    "My New Favorite SQL Error Message"
layout:   post
date:     2017-08-02
---

I received this error message today while trying to set up a [full-text index on SQL Server 2016](https://docs.microsoft.com/en-us/sql/t-sql/statements/create-fulltext-index-transact-sql). I have decided this is the best error message ever.

```
SQL72014: .Net SqlClient Data Provider: Msg 7653, Level 16, State 2, Line 1 'some_index' 
is not a valid index to enforce a full-text search key. A full-text search key must 
be a unique, non-nullable, single-column index which is not offline, is not defined 
on a non-deterministic or imprecise nonpersisted computed column, does not have 
a filter, and has maximum size of 900 bytes. Choose another index for the full-text 
key.
```

Well, I guess I know what I did wrong. ☺
