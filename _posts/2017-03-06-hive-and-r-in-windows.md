---
title:   "Hive and R in Windows"
layout:  post
date:    2017-03-06
tags: hive r
---

Last year I put together a post of working with [Hive and R](/2016/11/03/hive-and-r-playing-nicely-together). That example document was on MacOS. Fortunately, it is not difficult to get the same working on Windows. Let's work through an example.

To start, I'm going to assume that you have a working Hive instance already out there in the world. If you need help setting up Hive, you're going to need to find a different resource. That is beyond the scope of this entry.

```r
# Load required libraries. The `tibble` package is optional. It makes data frames
# look nicer when they are printed to the screen.
library(rJava)
library(RJDBC)
library(tibble)

# Set Java options, specifically the class path for where the Hadoop and Hive jar
# files are located on your machine. Your folder structure may vary.
options(java.parameters = "-Xmx8g")
hadoop_jars_dir <- c("C:/hadoop-2.7.3/share/hadoop/common",
                     "C:/hadoop-2.7.3/share/hadoop/common/lib",
                     "C:/hive-2.1.1/lib")
clpath <- c()
for (d in hadoop_jars_dir) {
  clpath <- c(clpath, list.files(d, pattern = "jar", full.names = TRUE))
}
.jinit(classpath = clpath)
.jaddClassPath(clpath)

# Set up variables for later use.
# Set the `hive_url` and `sql_query` as necessary for your connection.
hive_jdbc_jar <- "C:/hive-2.1.1/lib/hive-jdbc-2.1.1.jar"
hive_driver <- "org.apache.hive.jdbc.HiveDriver"
hive_url <- "jdbc:hive2://10.10.10.10:10500/activity"
sql_query <- "SELECT * FROM activity WHERE steps != 'NA'"

# Create in instance of our Hive driver.
drv <- JDBC(hive_driver, hive_jdbc_jar)

# Connect, query, and disconnect.
conn <- dbConnect(drv, hive_url)
rs <- dbSendQuery(conn, sql_query)
df <- dbFetch(rs, n = -1)
dbClearResult(rs)
dbDisconnect(conn)

# Clean up and show output.
df <- as_tibble(df)
print(df)
```

This produces the following result.

```
# A tibble: 15,264 × 4
    steps        date  interval
*   <chr>       <chr>     <dbl>
1       0  2012-10-02         0
2       0  2012-10-02         5
3       0  2012-10-02        10
4       0  2012-10-02        15
5       0  2012-10-02        20
6       0  2012-10-02        25
7       0  2012-10-02        30
8       0  2012-10-02        35
9       0  2012-10-02        40
10      0  2012-10-02        45
# ... with 15,254 more rows
```

Happy querying and data analysis.
