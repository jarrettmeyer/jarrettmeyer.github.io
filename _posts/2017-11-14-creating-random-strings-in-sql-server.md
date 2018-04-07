---
title:    "Creating Random Strings in SQL Server"
date:     2017-11-14
layout:   post
---

### The Challenge

I want to be able to create a random string in SQL Server.

### The Solution

This solution is presented in three parts. The first part is the ability to select a random integer between two boundary values. We need to pass in our random value, since SQL does not allow non-determinant functions (e.g. `RAND()`) to be called from within user-defined functions. As usual, we will also pass in our lower and upper bounds.

```sql
CREATE FUNCTION [dbo].[fn_RandIntBetween]
(
  @lower  INT,
  @upper  INT,
  @rand   FLOAT
)
RETURNS INT
AS
BEGIN
  DECLARE @result INT;
  DECLARE @range = @upper - @lower + 1;
  SET @result = FLOOR(@rand * @range + @lower);
  RETURN @result;
END
GO
```

The next part is to create a function to pick a random character from a given list of characters. Picking a random character will use the function we created above.

```sql
CREATE FUNCTION [dbo].[fn_PickRandomChar] 
(
  @chars VARCHAR(MAX),
  @rand  FLOAT	
)
RETURNS CHAR(1)
AS
BEGIN
  DECLARE @result CHAR(1) = NULL;
  DECLARE @resultIndex INT = NULL;
  IF @chars IS NULL
    SET @result = NULL;
  ELSE IF LEN(@chars) = 0
    SET @result = NULL
  ELSE 
  BEGIN
    SET @resultIndex = [dbo].[fn_RandIntBetween](1, LEN(@chars), @rand);
    SET @result = SUBSTRING(@chars, @resultIndex, 1);
  END

  RETURN @result;
END
```

We can use this function as follows.

```sql
DECLARE @rchar CHAR(1);
SELECT [dbo].[fn_PickRandomChar]('abcdefghijklmnopqrstuvwxyz', RAND()) as [Random Char];

-- Results:
-- Random Char
-- -----------
-- v
```

Pretty good, no?

Our last step is to create a stored procedure to generate a random string. Note: **this must be a stored procedure**. Because SQL Server does not allow `RAND()` in a user-defined function, we'll put our operation in a procedure.

```sql
CREATE PROCEDURE [dbo].[CreateRandomString]
  @minLength INT = 1,
  @maxLength INT = 50,
  @chars VARCHAR(200) = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
  @randomString VARCHAR(MAX) = NULL OUTPUT
AS
BEGIN
  SET NOCOUNT ON;

  -- Get the length of our string.
  DECLARE @stringLength INT = [dbo].[fn_RandIntBetween](@minLength, @maxLength, RAND());

  -- Set our random string to an empty string.
  SET @randomString = '';
	
  -- If our string is not yet the appropriate length, add another character to the string.
  WHILE LEN(@randomString) < @stringLength
  BEGIN
    SET @randomString = @randomString + [dbo].[fn_PickRandomChar](@chars, RAND());
  END

END
```

Now we have all of the tools we need to create a random string. Let's put it all together and see how this works.

```sql
DECLARE @minLength INT = 5;
DECLARE @maxLength INT = 20;
DECLARE @chars VARCHAR(26) = 'abcdefghijklmnopqrstuvwxyz';
DECLARE @text VARCHAR(50) = NULL;

EXEC [dbo].[CreateRandomString] @minLength = @minLength, 
                                @maxLength = @maxLength, 
                                @chars = @chars, 
                                @randomString = @text OUTPUT;
SELECT @randomString AS [Random String];

-- Results:
-- Random String
-- -------------
-- bcuwjolzrwk
```

Happy to help!
