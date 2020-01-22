---
title: "Creating a Table of Dates"
layout: post
date: 2017-12-11
description:
thumbnail: /assets/images/sql-server-logo.png
---

Last week, I posted an article on [creating a table of numbers](/2017/12/07/creating-a-table-of-numbers). Today, I am continuing by creating a table of dates. Like before, this is a table that we expect to build and write to once, and then read from many thousands of times.

This script has the following assumptions.

1. The schema `ref` already exists.
2. The table `ref.numbers` already exists.
3. US English is the only language and culture that you care about. If you need to support other languages and cultures, I recommend that you have a second table foreign keyed to this dates table that includes the culture info.

{% gist jarrettmeyer/ff8badfb39942db270011b91f9b953b9 create_dates.sql %}

What other columns would you include in your `dates` table?
