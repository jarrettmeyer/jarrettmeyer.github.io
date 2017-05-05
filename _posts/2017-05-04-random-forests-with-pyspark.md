---
title:   "Random Forests with PySpark"
layout:  post
date:    2017-05-04
---

[PySpark](https://spark.apache.org/docs/2.1.1/api/python/index.html) allows us to
run [Python](https://www.python.org/) scripts on Apache Spark. For this project, we
are going to use input attributes to predict fraudulent credit card transactions.
It is estimated that there are around 100 billion transactions per year.

### Versions

| Application       | Version |
|:-----------------:|:-------:|
| Spark             | 2.1.0   |
| Python            | 3.5.2   |
| pip               | 9.0.1   |
| Jupyter Notebook  | 4.3.0   |
| py4j              | 0.10.4  |

### Set constants

```py
CSV_PATH = "/vagrant/data/creditcard.csv"
APP_NAME = "Random Forest Example"
SPARK_URL = "local[*]"
RANDOM_SEED = 13579
TRAINING_DATA_RATIO = 0.7
RF_NUM_TREES = 3
RF_MAX_DEPTH = 4
RF_NUM_BINS = 32
```

### Load the data set

The [credit card fraud data set](https://www.kaggle.com/dalpozz/creditcardfraud/downloads/creditcardfraud.zip)
has been downloaded from [Kaggle](https://www.kaggle.com/). They have tons of data
available for free. I've saved the data to my local machine at `/vagrant/data/creditcard.csv`.
Be sure to set `inferschema = "true"` when you load the data.

```py
from pyspark import SparkContext
from pyspark.sql import SparkSession

spark = SparkSession.builder \
    .appName(APP_NAME) \
    .master(SPARK_URL) \
    .getOrCreate()

df = spark.read \
    .options(header = "true", inferschema = "true") \
    .csv(CSV_PATH)

print("Total number of rows: %d" % df.count())
```

    Total number of rows: 284,807

### Convert the data frame to a dense vector

Once the CSV data has been loaded, it will be a [DataFrame](https://spark.apache.org/docs/2.1.1/api/python/pyspark.sql.html#pyspark.sql.DataFrame).
We need to convert this Data Frame to an RDD of [LabeledPoint](https://spark.apache.org/docs/2.1.1/api/python/pyspark.mllib.html#module-pyspark.mllib.regression).
Additionally, we need to split the data into a training set and a test set. The
training set will be used to create the model. The test set will be used to test
the validity of the generated model.

```py
from pyspark.mllib.linalg import Vectors
from pyspark.mllib.regression import LabeledPoint

transformed_df = df.rdd.map(lambda row: LabeledPoint(row[-1], Vectors.dense(row[0:-1])))

splits = [TRAINING_DATA_RATIO, 1.0 - TRAINING_DATA_RATIO]
training_data, test_data = transformed_df.randomSplit(splits, RANDOM_SEED)

print("Number of training set rows: %d" % training_data.count())
print("Number of test set rows: %d" % test_data.count())
```

    Number of training set rows: 199,690
    Number of test set rows: 85,117

### Train the random forest

A random forest is a machine learning classification algorithm. Random forests are
generated collections of decision trees. We're also going to track the time
it takes to train our model.

```py
from pyspark.mllib.tree import RandomForest
from time import *

start_time = time()

model = RandomForest.trainClassifier(training_data, numClasses=2, categoricalFeaturesInfo={}, \
    numTrees=RF_NUM_TREES, featureSubsetStrategy="auto", impurity="gini", \
    maxDepth=RF_MAX_DEPTH, maxBins=RF_MAX_BINS, seed=RANDOM_SEED)

end_time = time()
elapsed_time = end_time - start_time
print("Time to train model: %.3f seconds" % elapsed_time)
```

    Time to train model: 7.935 seconds

### Make predictions and compute accuracy

Once we've trained our random forest model, we need to make predictions and test
the accuracy of the model. Fortunately, there is a handy `predict()` function available.
The accuracy is defined as the total number of correct predictions divided by the
total number of predictions.

```py
predictions = model.predict(test_data.map(lambda x: x.features))
labels_and_predictions = test_data.map(lambda x: x.label).zip(predictions)
acc = labels_and_predictions.filter(lambda x: x[0] == x[1]).count() / float(test_data.count())
print("Model accuracy: %.3f%%" % (acc * 100))
```

    Model accuracy: 99.945%

While 99.945% certainly sounds like a good model, remember there are over 100 billion
credit and debit card transactions per year. This means that this model is wrong
55 million times per year. Correcting this balancing and weighting is beyond the
scope of this blog post.

### Model evaluation

We can also compute [Precision/Recall (PR)](https://en.wikipedia.org/wiki/Precision_and_recall)
and [Receiver Operating Characteristic (ROC)](https://en.wikipedia.org/wiki/Receiver_operating_characteristic)
values for our model.

```py
from pyspark.mllib.evaluation import BinaryClassificationMetrics

start_time = time()

metrics = BinaryClassificationMetrics(labels_and_predictions)
print("Area under Precision/Recall (PR) curve: %.f" % (metrics.areaUnderPR * 100))
print("Area under Receiver Operating Characteristic (ROC) curve: %.3f" % (metrics.areaUnderROC * 100))

end_time = time()
elapsed_time = end_time - start_time
print("Time to evaluate model: %.3f seconds" % elapsed_time)
```

    Area under Precision/Recall (PR) curve: 79
    Area under Receiver Operating Characteristic (ROC) curve: 91.648
    Time to evaluate model: 10.173 seconds

The code for this blog post is available on [Github](https://github.com/jarrettmeyer/sparkvm).
