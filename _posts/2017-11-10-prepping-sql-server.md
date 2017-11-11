---
title:    "Prepping and Inspecting SQL Server"
layout:   post
date:     2017-11-10
---

![Microsoft SQL Server Logo](/assets/images/microsoft_sql_server_logo.png){: .align-center } 

Imagine you are a consultant, and you want to come in and inspect a SQL server architecture. How would you do it? What would you look for? What questions would you ask? Here's a checklist of ideas.

> This is a "living document" for prepping an instance of SQL Server. If you have suggestions, please send them to jarrettmeyer at gmail dot com.

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
5.  Ensure that your databases are not owned by user accounts. By default, a database is owned by the user who created the account. Databases should be owned by a non-user account. Either a single domain account should own all databases, or SA should own all databases.

    `ALTER AUTHORIZATION ON DATABASE::<your database name> TO sa;`

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
3.  Ensure that all SQL Agent Jobs have notifications enabled for failure conditions. Ideally, all agent jobs will send a failure notification email to a shared proxy account (e.g. dba@mycompany.com). Agent jobs should never fail silently.

### Maintenance Plans

1.  Ensure that you have a maintenance plan to run `CHECKDB` on all databases. `CHECKDB` [performs several functions](https://docs.microsoft.com/en-us/sql/t-sql/database-console-commands/dbcc-checkdb-transact-sql) in your database.
2.  Ensure that you have a maintenance plan to backup all databases. 
3.  Ensure that you have a maintenance plan to backup all transaction logs.
4.  Create a maintenance plan to [clean up MSDB history](https://www.mssqltips.com/sqlservertip/1727/purging-msdb-backup-and-restore-history-from-sql-server/).
5.  Create a maintenance plan to delete old backup files. All of those backups can start chewing up a lot of disk. This can either be part of the maintenance plan to clean up MSDB history (above), or it can be its own maintenance plan. Either way, you will want to keep the age of backups the same (e.g. 2 weeks).
6.  Provided you have a dedicated maintenance window or sufficiently small indexes, create a maintenance plan to clean up indexes. Indexes with > 30% fragmentation and over 1,000 pages should be rebuilt. Indexes with > 5% fragmentation and over 1,000 pages should be reorganized. (We don't care about small indexes. Who cares if small indexes are fragmented?) This operation is a blocking operation. If you do not have a maintenance window, or if your database is large enough to make this an unacceptably slow process, this should not be a maintenance task.

### Interview Questions

These questions will require you to talk to DBAs or system administrators.

1.  What is the policy for offsite backups?
2.  What is the business expectation for a system restore time window? These should be broadly defined (e.g. less than one minute, less than one hour, less than four hours, less than one day). Different expectations will have different costs.
3.  What policies exist to warm up buffers and caches? When changes to tables or indexes are published, are there processes or procedures that 
4.  Is reference data stored in its own schema (e.g. `[ref].*`)? Because reference data (e.g. area codes, counties, countries, genders, U.S. states) should rarely change, policies for your reference schema can be different than your policies for other transactional data. *Note: This question is important for applications with small maintenance windows.*

