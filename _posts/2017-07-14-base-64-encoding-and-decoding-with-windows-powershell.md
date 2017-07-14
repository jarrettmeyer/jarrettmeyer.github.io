---
title:    "Base 64 Encoding and Decoding with Windows PowerShell"
date:     2017-07-14
layout:   post
---

Windows PowerShell gives you full access to the .NET framework. This allows us to do anything that .NET can do. This allows us to use the encoding tools built into .NET to base64 encode a string.

```
> $bytes = [System.Text.Encoding]::ASCII.GetBytes("Hello World!")
> $base64String = [System.Convert]::ToBase64String($bytes)
> echo $base64String
SGVsbG8gV29ybGQh
```

To convert from base64, just run the process in reverse.

```
> $bytes = [System.Convert]::FromBase64String("SGVsbG8gV29ybGQh")
> $plainTextString = [System.Text.Encoding]::ASCII.GetString($bytes)
> echo $plainTextString
Hello World!
```

Pretty simple stuff. Happy coding!