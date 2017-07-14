---
title:    "SQL Server: Sending HTTP Requests"
layout:   post
date:     2017-07-08
---

Here's another fun trick I learned this week: sending HTTP requests with SQL Server. It turns out, we have access to a whole host of OLE automation classes from within SQL Server. The first thing we need to do is enable OLE automation. This is done with the `sp_configure` command.

{% gist jarrettmeyer/5990daf0db3b1f4fd759df6ed4099685 Enable_OLE_Automation.sql %}

Once OLE automation is enabled, you will be able to create OLE classes from within your scripts and stored procedures.

This example uses [requestb.in](https://requestb.in/16xdq1p1) for the HTTP target.

{% gist jarrettmeyer/5990daf0db3b1f4fd759df6ed4099685 Send_HTTP_Request.sql %}

You can inspect the request using the [inspect page at requestb.in](https://requestb.in/16xdq1p1?inspect).

Happy coding!
