---
title:    Installing MySQL on Ubuntu 16.04
layout:   post
date:     2017-06-23
---

As of this writing, `apt-get install mysql-server` will install version **5.7.18**. Unfortunately, this process cannot be automated, since you will be prompted for the root user password during the installation process.

```
$ apt-get update
$ apt-get install -y mysql-server
```

You will be prompted to enter a root password. I made mine `root`, but this is a development server, and those kinds of shenanigans are allowed.

If you need to allow remote connections, there are two more steps you need to follow. First of all, change the `bind-address` variable in `/etc/mysql/mysql.conf.d/mysqld.cnf`. By default you will see `bind-address = 127.0.0.1`. Change this to `bind-address = 0.0.0.0`. The last step to allow a remote connection is to grant the correct privilege.

```
$ mysql -u root -p
Enter password:
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 5
Server version: 5.7.18-0ubuntu0.16.04.1 (Ubuntu)

Copyright (c) 2000, 2017, Oracle and/or its affiliates. All rights reserved.

Oracle is a registered trademark of Oracle Corporation and/or its
affiliates. Other names may be trademarks of their respective
owners.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

mysql> use mysql
Reading table information for completion of table and column names
You can turn off this feature to get a quicker startup with -A

Database changed
mysql> GRANT ALL ON *.* to root@'<your.remote.ip.address>' IDENTIFIED BY '<your-root-password>';
Query OK, 0 rows affected, 1 warning (0.00 sec)

mysql> FLUSH PRIVILEGES;
Query OK, 0 rows affected (0.00 sec)

mysql> \q
Bye
```

You'll now be able to log on with MySQL Workbench to remotely manage your database.

I also recommend that you install `mysqltuner`. It is a [great tool](https://github.com/major/MySQLTuner-perl) for displaying recommendations and security holes.

```
$ apt-get install libtext-template-perl
$ wget https://raw.githubusercontent.com/major/MySQLTuner-perl/master/mysqltuner.pl
$ chmod +x mysqltuner.pl
$ mv mysqltuner.pl /usr/local/bin/mysqltuner
```

Store all the things!
