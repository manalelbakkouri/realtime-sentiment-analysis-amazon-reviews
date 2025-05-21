import json
import uuid
from kafka import KafkaProducer
from scripts.kafka_utils import get_bootstrap_servers
import logging
import argparse
import time

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class ReviewProducer:
    def __init__(self, topic="reviews"):
        self.topic = topic
        self.bootstrap_servers = get_bootstrap_servers()
        self.producer = None

    def initialize_producer(self):
        try:
            self.producer = KafkaProducer(
                bootstrap_servers=self.bootstrap_servers,
                value_serializer=lambda x: json.dumps(x).encode('utf-8')
            )
            logger.info(f"Producer initialized for topic: {self.topic}")
        except Exception as e:
            logger.error(f"Failed to initialize producer: {str(e)}")
            raise

    def send_review(self, review_data):
        if not self.producer:
            self.initialize_producer()
        
        if 'reviewId' not in review_data:
            review_data['reviewId'] = str(uuid.uuid4())
            
        try:
            future = self.producer.send(self.topic, review_data)
            logger.info(f"Review sent to topic {self.topic}: ID {review_data.get('reviewId')}")
            return future
        except Exception as e:
            logger.error(f"Error sending review: {str(e)}")
            raise

    def send_sample_review(self, text=None, summary=None):
        if text is None:
            text = "This product was really good. I enjoyed using it and would recommend it to others."
        
        if summary is None:
            summary = "Great product, highly recommended"
            
        review_data = {
            "reviewId": str(uuid.uuid4()),
            "reviewText": text,
            "summary": summary,
            "overall": 5.0
        }
        
        return self.send_review(review_data)

    def shutdown(self):
        logger.info("Shutting down producer...")
        if self.producer:
            self.producer.flush()
            self.producer.close()

def parse_review_from_args():
    parser = argparse.ArgumentParser(description="Send a review to Kafka")
    parser.add_argument("--text", type=str, help="Review text")
    parser.add_argument("--summary", type=str, help="Review summary")
    parser.add_argument("--file", type=str, help="JSON file containing reviews to send")
    return parser.parse_args()

if __name__ == "__main__":
    args = parse_review_from_args()
    producer = ReviewProducer()

    if args.file:
        try:
            with open(args.file, 'r', encoding='utf-8') as f:
                first_char = f.read(1)
                f.seek(0)
                if first_char == '[':
                    data = json.load(f)
                    for review in data:
                        producer.send_review(review)
                        time.sleep(0.5)
                else:
                    for line in f:
                        if line.strip():
                            try:
                                review = json.loads(line)
                                producer.send_review(review)
                                time.sleep(0.5)
                            except json.JSONDecodeError as je:
                                logger.error(f"Erreur de parsing JSON sur une ligne : {je}")
        except Exception as e:
            logger.error(f"Error loading file: {e}")
