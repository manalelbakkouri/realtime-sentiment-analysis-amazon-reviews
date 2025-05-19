from pyspark.sql import SparkSession
from pyspark.sql.functions import col, when, concat_ws, lit, trim, rand, length, avg, count
from pyspark.ml.feature import Tokenizer, StopWordsRemover, CountVectorizer, IDF
from pyspark.ml.classification import RandomForestClassifier
from pyspark.ml import Pipeline
from pyspark.ml.evaluation import MulticlassClassificationEvaluator
import os
import argparse
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import classification_report, confusion_matrix
import pandas as pd

def train_sentiment_model(input_path, output_path, target_size=1500):
    """Train a sentiment analysis model and save it to the specified path.
    
    Args:
        input_path: Path to the input JSON data
        output_path: Path to save the trained model
        target_size: Number of samples per class for balanced dataset
    """
    # Initialize Spark session
    spark = SparkSession.builder.appName("SentimentModelTraining").getOrCreate()
    
    try:
        print(f"\nReading data from {input_path}...")
        raw_df = spark.read.json(input_path)
        
        # Data Preprocessing
        df = raw_df.withColumn("label", 
                              when(col("overall") <= 2, 0)
                              .when(col("overall") == 3, 1)
                              .otherwise(2))
        
        df = df.withColumn("text", 
            concat_ws(" ", 
                when(col("summary").isNull(), "").otherwise(col("summary")),
                when(col("reviewText").isNull(), "").otherwise(col("reviewText"))
            )
        )
        
        df = df.withColumn("text", 
            when(col("text").isNull() | (trim(col("text")) == ""), lit("empty_review")).otherwise(col("text")))
        
        print("\nOriginal class distribution:")
        df.groupBy("label").agg(count("*").alias("count")).orderBy("label").show()
        
        # Balance the dataset
        class_0 = df.filter(col("label") == 0)
        class_1 = df.filter(col("label") == 1)
        class_2 = df.filter(col("label") == 2)
        
        c0_count = class_0.count()
        c1_count = class_1.count()
        c2_count = class_2.count()
        
        print(f"\nClass counts before balancing: Negative: {c0_count}, Neutral: {c1_count}, Positive: {c2_count}")
        
        def balance_class(df_class, target, class_name):
            current_count = df_class.count()
            if current_count == 0:
                print(f"WARNING: No samples in {class_name} class. Cannot balance.")
                return df_class
            
            if current_count < target:
                # Oversample
                ratio = int(target / current_count) + 1
                oversampled = df_class
                for _ in range(ratio - 1):
                    oversampled = oversampled.union(df_class)
                return oversampled.orderBy(rand()).limit(target)
            else:
                # Undersample
                return df_class.orderBy(rand()).limit(target)
        
        print("\nBalancing dataset...")
        balanced_0 = balance_class(class_0, target_size, "negative")
        balanced_1 = balance_class(class_1, target_size, "neutral")
        balanced_2 = balance_class(class_2, target_size, "positive")
        
        balanced_df = balanced_0.union(balanced_1).union(balanced_2).orderBy(rand())
        
        print("\nBalanced class distribution:")
        balanced_df.groupBy("label").agg(count("*").alias("count")).orderBy("label").show()
        
        # Create ML Pipeline
        tokenizer = Tokenizer(inputCol="text", outputCol="words")
        stopwords_remover = StopWordsRemover(inputCol="words", outputCol="filtered")
        vectorizer = CountVectorizer(inputCol="filtered", outputCol="rawFeatures", vocabSize=10000, minDF=2)
        idf = IDF(inputCol="rawFeatures", outputCol="features")
        rf = RandomForestClassifier(featuresCol="features", labelCol="label", numTrees=100, maxDepth=20)
        
        pipeline = Pipeline(stages=[tokenizer, stopwords_remover, vectorizer, idf, rf])
        
        # Split data into training and testing sets
        train_data, test_data = balanced_df.randomSplit([0.8, 0.2], seed=42)
        
        # Train the model
        print("\nTraining model...")
        model = pipeline.fit(train_data)
        
        # Evaluate the model
        print("\nEvaluating model...")
        predictions = model.transform(test_data)
        
        evaluator = MulticlassClassificationEvaluator(
            labelCol="label", 
            predictionCol="prediction", 
            metricName="accuracy")
        
        accuracy = evaluator.evaluate(predictions)
        print(f"\nAccuracy: {accuracy:.4f}")
        
        # Additional metrics
        pdf = predictions.select("label", "prediction").toPandas()
        y_true = pdf["label"].astype(int)
        y_pred = pdf["prediction"].astype(int)
        
        # Map numeric labels to string classes
        label_names = {0: "negative", 1: "neutral", 2: "positive"}
        y_true_named = [label_names[i] for i in y_true]
        y_pred_named = [label_names[i] for i in y_pred]
        
        # Generate classification report
        report = classification_report(y_true_named, y_pred_named, digits=3)
        print("\n=== Classification Report ===")
        print(report)
        
        # Generate confusion matrix
        conf_matrix = confusion_matrix(y_true_named, y_pred_named, labels=["negative", "neutral", "positive"])
        print("\n=== Confusion Matrix ===")
        print(conf_matrix)
        
        # Visualize confusion matrix
        plt.figure(figsize=(8, 6))
        sns.heatmap(
            conf_matrix, 
            annot=True, 
            fmt="d", 
            cmap="Blues", 
            xticklabels=["negative", "neutral", "positive"],
            yticklabels=["negative", "neutral", "positive"]
        )
        plt.xlabel("Predicted")
        plt.ylabel("Actual")
        plt.title("Confusion Matrix")
        plt.tight_layout()
        
        # Create output directory if it doesn't exist
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        # Save the confusion matrix
        plt.savefig(f"{os.path.dirname(output_path)}/confusion_matrix.png")
        print(f"\nConfusion matrix visualization saved as '{os.path.dirname(output_path)}/confusion_matrix.png'")
        
        # Save the model
        model.write().overwrite().save(output_path)
        print(f"\nModel saved to {output_path}")
        
        # Feature importance
       # if hasattr(model.stages[-1], "featureImportances"):
         ##   importances = model.stages[-1].featureImportances
          #  vocab = model.stages[2].vocabulary  # CountVectorizer vocabulary
            
            # Get top features
          #  indices = importances.toArray().argsort()[-20:][::-1]
           # top_features = [(vocab[i], float(importances[i])) for i in indices if i < len(vocab)]
            
           # print("\nTop 20 important features:")
           # for word, importance in top_features:
              #  print(f"{word}: {importance:.5f}")
                
            # Save feature importance to a file
           # with open(f"{os.path.dirname(output_path)}/feature_importance.txt", "w") as f:
              #  for word, importance in top_features:
                    #f.write(f"{word}: {importance:.5f}\n")
                    
    finally:
        # Stop Spark session
        spark.stop()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train a sentiment analysis model")
    parser.add_argument("--input", type=str, default="data/reviews.json", help="Path to input JSON data")
    parser.add_argument("--output", type=str, default="models/sentiment_model", help="Path to save the model")
    parser.add_argument("--target-size", type=int, default=1500, help="Number of samples per class")
    
    args = parser.parse_args()
    
    train_sentiment_model(args.input, args.output, args.target_size)