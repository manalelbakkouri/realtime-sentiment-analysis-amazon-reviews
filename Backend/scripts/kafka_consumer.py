import json
from kafka import KafkaConsumer
from kafka_utils import get_bootstrap_servers
from models.sentiment_predictor import SentimentPredictor
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class SentimentConsumer:
    def __init__(self, topic="reviews", group_id="sentiment-consumer", model_path="models/sentiment_model"):
        """Initialize the sentiment consumer.
        
        Args:
            topic: Kafka topic to consume from
            group_id: Consumer group ID
            model_path: Path to the saved sentiment model
        """
        self.topic = topic
        self.group_id = group_id
        self.bootstrap_servers = get_bootstrap_servers()
        self.predictor = SentimentPredictor(model_path=model_path)
        self.consumer = None

    def initialize_consumer(self):
        """Initialize Kafka consumer with the appropriate configuration."""
        try:
            self.consumer = KafkaConsumer(
                self.topic,
                bootstrap_servers=self.bootstrap_servers,
                group_id=self.group_id,
                auto_offset_reset='earliest',
                value_deserializer=lambda x: json.loads(x.decode('utf-8')),
                enable_auto_commit=True
            )
            logger.info(f"Consumer initialized. Listening to topic: {self.topic}")
        except Exception as e:
            logger.error(f"Failed to initialize consumer: {str(e)}")
            raise

    def process_message(self, message):
        """Process a single message from Kafka.
        
        Args:
            message: Kafka message containing review data
            
        Returns:
            Processed message with sentiment prediction
        """
        try:
            # Get the review data from the message
            review_data = message.value
            
            # Add logging for debugging
            logger.debug(f"Processing message: {review_data}")
            
            # Predict sentiment
            result = self.predictor.predict_sentiment(review_data)
            
            logger.info(f"Processed review ID: {review_data.get('reviewId', 'unknown')}, "
                       f"Sentiment: {result.get('sentiment', 'unknown')}")
            
            return result
        except Exception as e:
            logger.error(f"Error processing message: {str(e)}")
            return {"error": str(e), "original_data": message.value}

    def start_consuming(self):
        """Start consuming messages from Kafka and processing them."""
        if not self.consumer:
            self.initialize_consumer()
            
        try:
            logger.info("Starting to consume messages...")
            for message in self.consumer:
                processed_message = self.process_message(message)
                
                # Here you could send the processed message to another Kafka topic,
                # save to a database, or perform any other action with the results
                
                # Example: Logging the processed message
                logger.debug(f"Processed message: {processed_message}")
                
        except KeyboardInterrupt:
            logger.info("Consumption interrupted by user")
        except Exception as e:
            logger.error(f"Error during consumption: {str(e)}")
        finally:
            self.shutdown()

    def shutdown(self):
        """Shutdown the consumer and predictor."""
        logger.info("Shutting down consumer...")
        if self.consumer:
            self.consumer.close()
        
        if self.predictor:
            self.predictor.shutdown()

if __name__ == "__main__":
    consumer = SentimentConsumer()
    consumer.start_consuming()