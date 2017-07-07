---
title:   "SQL Server: Padding with Spaces"
layout:  post
date:    2017-07-07
---

I've been working on a flat-file transfer operation. It's the kind of thing where last name starts at character 13 and is 20 characters long. Fortunately, this is a very easy function to write.

```sql
CREATE FUNCTION [dbo].[PadRight]
(
    @value   NVARCHAR(MAX),
    @length  INT
)
RETURNS NVARCHAR(MAX)
AS
BEGIN
    RETURN LEFT(ISNULL(@value, '') + SPACE(@length), @length);
END
```

We can now easily invoke this function.

```sql
dbo.PadRight([FirstName], 20)   -- ==> 'Jack                '
dbo.PadRight(NULL, 10)          -- ==> '          '
dbo.PadRight('Hello World!', 7) -- ==> 'Hello W'
```

See? Easy!
