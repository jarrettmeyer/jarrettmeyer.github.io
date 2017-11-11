---
title:    "Prepping SQL Server"
layout:   post
date:     2017-11-10
---

> This is a "living document" for prepping an instance of SQL Server.

### Configuration

1.  Ensure that your databases are not on your C: drive. Databases can grow and take all of the space on C:. This is bad. This is especially true of TempDB.
2.  Ensure that your data folders and backup folder are one different drives. We often see scenarios were the data is stored in `S:\SQL Server\Data` and backups are stored on `S:\SQL Server\Backups`. This is not ideal. If you lose your S: drive, you can lose both your data and your backups. Even in a RAID scenario, the RAID controller itself can fail, leading to inaccessible data.
3.  (SQL Server 2016) Ensure that the **query store** option is enabled on all databases. This allows SQL server to retain information about query plans and performance. This is done with the following command.

    `ALTER DATABASE <database> SET QUERY_STORE = ON;`
    
4.  Compare databases and system architecture between Production and non-production instances. 
    --  Check the system hardware. To get good comparisons between a test/staging environment and a production environment, hardware should be identical. If it is not identical, then metrics collected in test/staging may not be reliable.  
    --  Ensure that databases have similar amounts of data in Production and non-production environments. I have seen scenarios where Production data has millions or billions of rows, while a test environment only has a few thousand rows of data. Obviously, you cannot troubleshoot performance between the systems.  
    --  Ensure that databases have the same recovery mode in Production and non-production environments. If a database has `FULL RECOVERY` mode in production, but `SIMPLE RECOVERY` in test, you may find that test is faster than production.  
    --  If you are using Developer Edition in test and Standard Edition in Production, you can run into threading and parallelism issues. Developer Edition has the same feature set as Enterprise Edition, so it will use every bit of compute and memory available. However, Standard Edition has caps on CPU, RAM, and degrees of parallelism! For example, the new `COLUMNSTORE INDEX` is [now available in all versions of SQL Server as of 2016 SP1](https://blogs.msdn.microsoft.com/sql_server_team/columnstore-index-standard-and-express-editions-with-sql-server-2016-sp1/). But, as usual, you get what you pay for. In Enterprise Edition, it will use every thread it can; Standard Edition will use up to 2 threads; Web & Express Editions will only use one thread. In a query execution plan, you can see the degrees of parallelism under "Properties".  

### Installing Useful Procedures

1.  Install Adam Machanic's `sp_WhoIsActive`. This is a super handy script that tells you who is connected to your server and what is running. It can be downloaded from [whoisactive.com/downloads](http://whoisactive.com/downloads/).
2.  Install Ola Hallengren's maintenance scripts. They can be downloaded from [ola.hallengren.com/downloads.html](https://ola.hallengren.com/downloads.html).
3.  Install Brent Ozar's SQL Server First Responder Kit. This includes `sp_Blitz` and several other very useful procedures. These scripts can be downloaded from [github.com](https://github.com/BrentOzarULTD/SQL-Server-First-Responder-Kit/releases).

### Setting Alerts

1.  Add an alert for **TempDB Growing**. This should be set to an appropriate value relative to the disk holding TempDB.

    ![Alert: TempDB Growing 1](/assets/images/alert-tempdb-growing-1.png)
    ![Alert: TempDB Growing 2](/assets/images/alert-tempdb-growing-2.png)
    ![Alert: TempDB Growing 3](/assets/images/alert-tempdb-growing-3.png)

2.  For any sufficiently large databases, set a disk size alert. This is done similarly to setting a disk size alert for TempDB, shown above.

### Maintenance Plans

1.  Ensure that you have a maintenance plan to run `CHECKDB` on all databases. `CHECKDB` [performs several functions](https://docs.microsoft.com/en-us/sql/t-sql/database-console-commands/dbcc-checkdb-transact-sql) in your database.
2.  Ensure that you have a maintenance plan to backup all databases. 
3.  Create a maintenance plan to [clean up MSDB history](https://www.mssqltips.com/sqlservertip/1727/purging-msdb-backup-and-restore-history-from-sql-server/).
4.  Provided you have a dedicated maintenance window or sufficiently small indexes, create a maintenance plan to clean up indexes. Indexes with > 30% fragmentation and over 1,000 pages should be rebuilt. Indexes with > 5% fragmentation and over 1,000 pages should be reorganized. (We don't care about small indexes. Who cares if small indexes are fragmented?) This operation is a blocking operation. If you do not have a maintenance window, or if your database is large enough to make this an unacceptably slow process, this should not be a maintenance task.
