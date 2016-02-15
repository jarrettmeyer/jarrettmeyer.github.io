---
layout:   post
title:    "Inserting Data into HBase with Python"
date:     2016-02-15
---

For this little project, we are going to use the [Happybase](https://github.com/wbolster/happybase) Python package. Happybase uses HBase's Thrift API.

For our test, we are going to create a namespace and a table in HBase. We will do this in the HBase shell. To make things simple, our table is going to have only one column family - `data`, and we are going to accept all defaults.

```
% hbase shell
hbase> create_namespace "sample_data"
hbase> create "sample_data:rfic", "data"
```

The data for this project was downloaded from [data.indy.gov](https://data.indy.gov) on 10 February 2016.

### Batching

You can insert directly into a table with the `Table#put()` function. However, I recommend using `Batch#put()` instead. When the number of records reaches the `batch_size`, `Batch#send()` will be called. See the section on benchmarks for timing data.

When you're done, be sure to call `Batch#send()` manually, to flush any remaining records to the database.

### Benchmarks

I ran the program for several batch sizes and averaged the results. As you can see from the time results, we can only go so fast - a little above 2 seconds - before we cannot insert any faster.

| Batch (n) | Time (s) |
| --------: | -------: |
|         1 |   10.227 |
|       100 |    3.533 |
|     1,000 |    2.091 |
|     2,000 |    2.141 |
|     5,000 |    2.081 |
|    10,000 |    2.190 |

### The code

{% gist jarrettmeyer/26b3e1fcd423071a7a6d %}
