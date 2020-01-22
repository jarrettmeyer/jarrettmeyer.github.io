---
title: "Extract a Filename from Path in SQL Server"
layout: post
date: 2017-11-08
description:
thumbnail: /assets/images/sql-server-logo.png
---

Here's a fun little problem that I had. I needed to extract a filename from a full path in SQL Server. This is the handy function that I found to accomplish this.

{% gist jarrettmeyer/a648a879eb6d29a5a46cd9fc709f850e fn_FilenameFromFullPath.sql %}

Hopefully, someone else will be able to use this.
