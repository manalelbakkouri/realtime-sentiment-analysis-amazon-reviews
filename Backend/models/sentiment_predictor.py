from pyspark.sql import SparkSession
from pyspark.ml import PipelineModel
from pyspark.sql.functions import col, when, concat_ws, lit, trim
import os
import json

class SentimentPredictor:
    def __init__(self, model_path="models/sentiment_model"):
        """Initialize the sentiment predictor with a pre-trained model.
        
        Args:
            model_path: Path to the saved PipelineModel
        """
        self.model_path = model_path
        self.spark = None
        self.model = None
        self.initialize_spark()
        self.load_model()
        
    def initialize_spark(self):
        """Initialize a Spark session."""
        self.spark = SparkSession.builder \
            .appName("SentimentPredictionService") \
            .getOrCreate()
        
    def load_model(self):
        """Load the pre-trained sentiment analysis model."""
        if os.path.exists(self.model_path):
            self.model = PipelineModel.load(self.model_path)
            print(f"Model loaded from {self.model_path}")
        else:
            print(f"Model not found at {self.model_path}. You need to train it first.")
            
    def preprocess_text(self, df):
        """Preprocess the input text similar to how the training data was processed.
        
        Args:
            df: Spark DataFrame with 'summary' and 'reviewText' columns
            
        Returns:
            Spark DataFrame with additional 'text' column
        """
        return df.withColumn("text", 
            concat_ws(" ", 
                when(col("summary").isNull(), "").otherwise(col("summary")),
                when(col("reviewText").isNull(), "").otherwise(col("reviewText"))
            )
        ).withColumn("text", 
            when(col("text").isNull() | (trim(col("text")) == ""), lit("empty_review")).otherwise(col("text"))
        )
    
    def predict_sentiment(self, data):
        """Predict sentiment for the given input data.
        
        Args:
            data: Dictionary or JSON string containing 'summary' and/or 'reviewText'
            
        Returns:
            Dictionary with original data and sentiment prediction
        """
        if self.model is None:
            return {"error": "Model not loaded"}
            
        # Parse input data
        if isinstance(data, str):
            try:
                data = json.loads(data)
            except json.JSONDecodeError:
                return {"error": "Invalid JSON input"}
        
        # Create a DataFrame from the input
        input_df = self.spark.createDataFrame([data])
        
        # Preprocess the data
        processed_df = self.preprocess_text(input_df)
        
        # Make prediction
        result = self.model.transform(processed_df)
        
        # Map numeric prediction to sentiment labels
        sentiment_map = {0: "negative", 1: "neutral", 2: "positive"}
        
        # Extract the result
        prediction_row = result.select("prediction").collect()[0]
        prediction = int(prediction_row.prediction)
        sentiment = sentiment_map.get(prediction, "unknown")
        
        # Create response
        response = data.copy()
        response["sentiment"] = sentiment
        response["sentiment_code"] = prediction
        
        return response
    
    def predict_batch(self, data_list):
        """Predict sentiment for a batch of inputs.
        
        Args:
            data_list: List of dictionaries or JSON strings
            
        Returns:
            List of prediction results
        """
        results = []
        for data in data_list:
            results.append(self.predict_sentiment(data))
        return results
    
    def shutdown(self):
        """Stop the Spark session."""
        if self.spark:
            self.spark.stop()