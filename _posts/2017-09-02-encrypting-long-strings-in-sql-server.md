---
title: "Encrypting Long Strings in SQL Server"
layout: post
date: 2017-09-02
description:
thumbnail: /assets/images/sql-server-logo.png
---

Today, I ran into my first instance of encrypting a long - `varchar(max)` - string in SQL Server. This is a known problem, as encryption is limited to a single page (i.e. 8192 bytes).

First, let's make sure your database is set up for encryption.

```sql
create master key encryption
  by password = 'This.Is.A.Terrible.Password!';
go

create certificate MyCertificate
  with subject = 'This is my SQL Server certificate';
go

create symmetric key MySymmetricKey
	with algorithm = AES_256
	encryption by certificate MyCertificate;
go
```

Here's the long string that we want to encrypt.

> Here's to the crazy ones. The misfits. The rebels. The troublemakers. The round pegs in the square holes. The ones who see things differently. They're not fond of rules. And they have no respect for the status quo. You can quote them, disagree with them, glorify or vilify them. About the only thing you can't do is ignore them. Because they change things. They push the human race forward. And while some may see them as the crazy ones, we see genius. Because the people who are crazy enough to think they can change the world, are the ones who do.

We're also going to print out the checksum, just to verify the string.

```sql
declare @longString varchar(max) = 'Here''s to the crazy ones. The misfits. The rebels. The troublemakers. The round pegs in the square holes. The ones who see things differently. They''re not fond of rules. And they have no respect for the status quo. You can quote them, disagree with them, glorify or vilify them. About the only thing you can''t do is ignore them. Because they change things. They push the human race forward. And while some may see them as the crazy ones, we see genius. Because the people who are crazy enough to think they can change the world, are the ones who do.';
select checksum(@longString) as [Checksum];
```

| Checksum    |
| :---------- |
| -1553434881 |

Let's set up the code to break up the `longString` into segments. For this demo, I am going to break up the string into 100 character segments.

### Breaking up is hard to do

```sql
declare @break int = 100;
declare @encryptedSegment varbinary(max);
declare @lineNumber int = 0;
declare @plainSegment varchar(max);

declare @temp table (
  LineNumber int,
  PlainText varchar(max),
  EncryptedText varbinary(max)
);

open symmetric key MySymmetricKey decryption by certificate MyCertificate;

while len(@longString) > 0
begin
  set @lineNumber = @lineNumber + 1;
  set @plainSegment = substring(@longString, 1, @break);
  set @longString = substring(@longString, @break + 1, len(@longString));
  set @encryptedSegment = ENCRYPTBYKEY(Key_GUID('MySymmetricKey'), @plainSegment);
  insert into @temp (LineNumber, PlainText, EncryptedText)
  values (@lineNumber, @plainSegment, @encryptedSegment);
end

select * from @temp;
```

| Line | PlainText    | EncryptedText                                                    |
| :--- | :----------- | :--------------------------------------------------------------- |
| 1    | Here's to... | 0x00C64BA573D52E4A87A8E80FA9BDAC0101000000CF8A13E77D3D7B4BE11... |
| 2    | oles. The... | 0x00C64BA573D52E4A87A8E80FA9BDAC010100000004F43C3D2F0B8696248... |
| 3    | he status... | 0x00C64BA573D52E4A87A8E80FA9BDAC0101000000B41D84CE43D6BA8276C... |
| 4    | you can't... | 0x00C64BA573D52E4A87A8E80FA9BDAC0101000000EE273A249FAE3008CFB... |
| 5    | some may...  | 0x00C64BA573D52E4A87A8E80FA9BDAC0101000000CCF8A7DCA139902C95B... |
| 6    | k they ca... | 0x00C64BA573D52E4A87A8E80FA9BDAC01010000007B1EDDD06BEA7EC27B7... |

From here, we have a few options. We can create a table to store the encrypted segments, or we store the segments as XML or JSON. For this example, I will use XML.

```sql
declare @xml xml;
set @xml = (select LineNumber as '@sequest', EncryptedText as '*' from @temp order by LineNumber for xml path ('segment'), root ('segments'));
select @xml;
```

This produces the following XML.

```xml
<segments>
  <segment sequence="1">AMZLpXPVLkqHqOgPqb2sAQEAAADkEmXMadngts39Fb9GTpMkimyEjWBvN9vUvPGVf3qe66MpR0IcLmLWzYUZjrzDxHAZdK0N24L+4nR2LDJUoM4Ua/7ZX4+3kxz4ZSy16DRgxbEIKup3nfoSZlbmrAxYNhJF/m3dpVbmf74mTkgg6v0RT98xdZ8Dp2znaCuTp9grYA==</segment>
  <segment sequence="2">AMZLpXPVLkqHqOgPqb2sAQEAAAA57LsJLskOuKdR7BBYK7JBoXYl/k81ow1QmsYhxZNH7UCf8zck16/vrFINNC3YDpirwxP2W/Z9G+W3s4uRZLFe0THZjKU64Nd72GdIC8Ml5kO0euRxx9yhCaUPm8h2n38DZJHzMgsdze7dvPfZlk94pjHpx1JeuEQU06XlMBuGSw==</segment>
  <segment sequence="3">AMZLpXPVLkqHqOgPqb2sAQEAAACEz2e4YgQxf0ZMTqBFOi+Hex3rUsemJWi7lP/KibAjR00xeZVIyEhcGgt7vgqJTYXTlnEhKHUu+cQaO8kFjKeKUZUUippkGxNg/Eyxg7ziz9j6AQhPoqylMpLG1bUEhFNeNHDmpL3rZXqUaa7Zw2KWAgYeC1CrwFz9FnkaFQas5w==</segment>
  <segment sequence="4">AMZLpXPVLkqHqOgPqb2sAQEAAAD8CzLB/0xf4H8KIQdkSKz85SZutda8jpT4mdvolg/8uIqszDBiQYVyg9U7wiog1WBMcLIch4b4mbM78rGxelsfqOzTb5laipr331KtWaO362vo4FKY+ahGmsGuTf3BaYC5cIr36BA8mgOELBUwmXv2blUUcNV2HvfZofRrOWYblg==</segment>
  <segment sequence="5">AMZLpXPVLkqHqOgPqb2sAQEAAADUVLMehyw8Re3JD0FJZVwfAZ/zQ/Q389J/B8Nx75C6+Y7yPDSrPHgkrVRawFAeN/cG2enefEXHG128SkaYgx6N75yGXI/WQK5z27pEKQUhWFS7U0BPFWcgFc5XNOpa0Y23UToqReqrp9m7lH808xJiZGUoVylNSQmv0JLHEk3wvw==</segment>
  <segment sequence="6">AMZLpXPVLkqHqOgPqb2sAQEAAAD9OpVIrSuS/BbKD8lt31/hjmVIkJ1lptd1aIW9a4EucQ5cTvkPfOT1xrQGld2VpuYP2fdER91PfqGk3HyoNMvypwtrz0XraWnoXdbjJvu5bQ==</segment>
</segments>
```

Success!

### Getting back together again

Putting the string back together is a matter of doing everything in reverse.

```sql
declare @temp2 table (
  LineNumber int,
  EncryptedText varbinary(max),
  PlainText varchar(max)
);

insert into @temp2 (LineNumber, EncryptedText, PlainText)
select t.c.value('@sequence[1]', 'int'), t.c.value('.[1]', 'varbinary(max)'), null
from @xml.nodes('/segments/segment') t(c);

update @temp2 set PlainText = convert(varchar(max), DECRYPTBYKEY(EncryptedText));
select * from @temp2;
```

| Line | EncryptedText                                                    | PlainText        |
| :--- | :--------------------------------------------------------------- | :--------------- |
| 1    | 0x00C64BA573D52E4A87A8E80FA9BDAC0101000000A1C8A541DC24515AA20... | Here's to the... |
| 2    | 0x00C64BA573D52E4A87A8E80FA9BDAC01010000008D32B01513CD613598D... | oles. The one... |
| 3    | 0x00C64BA573D52E4A87A8E80FA9BDAC0101000000BB9B20DA4AC976835B9... | he status quo... |
| 4    | 0x00C64BA573D52E4A87A8E80FA9BDAC010100000028905B51ABB8F8E61BB... | you can't do ... |
| 5    | 0x00C64BA573D52E4A87A8E80FA9BDAC0101000000E2DB179E4A364BEBF32... | some may see ... |
| 6    | 0x00C64BA573D52E4A87A8E80FA9BDAC0101000000FDC5D37D139AF7E78BE... | k they can ch... |

Putting together all the plain text is quite simple.

```sql
declare @finalString varchar(max);
select @finalString = coalesce(@finalString, '') + PlainText from @temp2 order by Line;
select @finalString as [String], CHECKSUM(@finalString) as[Checksum];
```

| String                                                          | Checksum    |
| :-------------------------------------------------------------- | :---------- |
| Here's to the crazy ones. The misfits. The rebels. The troub... | -1553434881 |

The checksum matches. We are back to where we started! Store all the things securely!

### Get the gist

For simplicity's sake, I have turned these steps into scalar-valued functions. Use at your own risk, etc. Here's the encryption function.

{% gist jarrettmeyer/5659feec3efd44cd7fb33d981c20a05b EncryptStringToXML.sql %}

I can now, very easily, store my long text data in an encrypted format.

```sql
create table Demo (
  [Key] int not null identity(1, 1),
  [ContentEncryptedXML] xml not null,
  [ContentChecksum] int not null,
  [InsertedDate] datetimeoffset(0) not null,
)

create procedure InsertDemo
  @content varchar(max)
as
begin
  set nocount on;
  begin transaction;

  open symmetric key MySymmetricKey decryption by certificate MyCertificate;

  insert into Demo (ContentEncryptedXML, ContentChecksum, InsertedDate)
  values (
    dbo.EncryptStringToXML(@content, 'MySymmetricKey'),
    checksum(@content),
    sysdatetimeoffset()
  );

  commit transaction;
end
```

And here is the decryption function.

{% gist jarrettmeyer/5659feec3efd44cd7fb33d981c20a05b DecryptStringFromXML.sql %}
