from kafka import KafkaConsumer
import json
import threading
import time
from datetime import datetime
from bson import ObjectId
import os
import sys

# Ajouter le répertoire parent au path pour les imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def consume_messages(socketio, predictor, predictions_collection):
    """
    Consomme les messages du topic Kafka et effectue des prédictions de sentiment.
    
    Args:
        socketio: Instance SocketIO pour les notifications en temps réel
        predictor: Instance SentimentPredictor pour les prédictions
        predictions_collection: Collection MongoDB pour stocker les résultats
    """
    # Essayer de se connecter à Kafka avec plusieurs tentatives
    max_retries = 5
    retries = 0
    consumer = None
    
    while retries < max_retries and consumer is None:
        try:
            consumer = KafkaConsumer(
                'reviews',
                bootstrap_servers=['kafka:9092'],
                auto_offset_reset='earliest',
                value_deserializer=lambda x: json.loads(x.decode('utf-8')),
                group_id='amazon-reviews-group',
                consumer_timeout_ms=30000  # Timeout de 30 secondes
            )
            print("Connexion à Kafka réussie!")
        except Exception as e:
            retries += 1
            print(f"Tentative {retries}/{max_retries} de connexion à Kafka a échoué: {e}")
            time.sleep(5)  # Attendre 5 secondes avant de réessayer
    
    if consumer is None:
        print("Impossible de se connecter à Kafka après plusieurs tentatives.")
        return
    
    print("Kafka consumer démarré et prêt à recevoir des messages...")
    
    # Traiter les messages entrants
    for message in consumer:
        try:
            review = message.value
            
            # Extraire le texte de l'avis
            review_text = review.get('reviewText', '')
            if not review_text:
                continue  # Ignorer les avis sans texte
            
            # Prédire le sentiment avec le modèle
            prediction = predictor.predict(review_text)
            
            # Obtenir les probabilités si disponible
            try:
                probabilities = predictor.predict_proba(review_text)
                confidence = max(probabilities) if probabilities else None
            except:
                probabilities = None
                confidence = None
            
            # Déterminer le sentiment basé sur la prédiction
            if prediction == 0:
                sentiment = "negative"
            elif prediction == 1:
                sentiment = "neutral"
            else:
                sentiment = "positive"
            
            # Préparation de la structure des données pour MongoDB et le frontend
            prediction_result = {
                "reviewerID": review.get('reviewerID', ''),
                "asin": review.get('asin', ''),
                "reviewText": review_text,
                "overall": review.get('overall', 0),
                "summary": review.get('summary', ''),
                "unixReviewTime": review.get('unixReviewTime', 0),
                "reviewTime": review.get('reviewTime', ''),
                "prediction": int(prediction),
                "sentiment": sentiment,
                "confidence": confidence,
                "probabilities": probabilities,
                "timestamp": datetime.now(),
                "processed_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            }
            
            # Sauvegarder dans MongoDB
            result = predictions_collection.insert_one(prediction_result)
            
            # Préparation pour SocketIO (conversion des types non JSON-serializable)
            socketio_result = prediction_result.copy()
            socketio_result['_id'] = str(result.inserted_id)
            socketio_result['timestamp'] = socketio_result['timestamp'].isoformat()
            
            if probabilities:
                socketio_result['probabilities'] = [float(p) for p in probabilities]
            
            # Envoyer les résultats en temps réel aux clients connectés
            socketio.emit('new_prediction', socketio_result)
            
            print(f"Avis traité: {prediction_result['asin']} - {sentiment} (confidence: {confidence:.2f if confidence else 'N/A'})")
        
        except Exception as e:
            print(f"Erreur lors du traitement d'un message: {e}")

def start_consumer_thread(socketio, predictor, predictions_collection):
    """
    Démarre le consumer Kafka dans un thread séparé.
    
    Args:
        socketio: Instance SocketIO pour les notifications en temps réel
        predictor: Instance SentimentPredictor pour les prédictions
        predictions_collection: Collection MongoDB pour stocker les résultats
        
    Returns:
        Thread: Le thread du consumer
    """
    consumer_thread = threading.Thread(
        target=consume_messages,
        args=(socketio, predictor, predictions_collection)
    )
    consumer_thread.daemon = True
    consumer_thread.start()
    
    print("Thread consumer Kafka démarré")
    return consumer_thread

import json
from kafka import KafkaConsumer
from scripts.kafka_utils import get_bootstrap_servers
from models.sentiment_predictor import SentimentPredictor
import logging
from pymongo import MongoClient
import sys
import os
os.environ['PYSPARK_PYTHON'] = 'C:\\Users\\admin\\Documents\\github\\realtime-sentiment-analysis-amazon-reviews\\venv-py310\\Scripts\\python.exe'
os.environ['PYSPARK_DRIVER_PYTHON'] = 'C:\\Users\\admin\\Documents\\github\\realtime-sentiment-analysis-amazon-reviews\\venv-py310\\Scripts\\python.exe'
os.environ['SPARK_LOCAL_IP'] = '127.0.0.1'
os.environ['SPARK_LOCAL_DIRS'] = 'C:/temp'

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

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
        self.mongo_client = None
        self.mongo_collection = None
        self.initialize_mongo()

    def initialize_mongo(self):
        """Initialize MongoDB connection and collection."""
        try:
            self.mongo_client = MongoClient("mongodb://localhost:27017")
            db = self.mongo_client["sentiment_analysis"]
            self.mongo_collection = db["predicted_reviews"]
            logger.info("MongoDB connection initialized.")
        except Exception as e:
            logger.error(f"Failed to connect to MongoDB: {str(e)}")
            raise

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
            review_data = message.value
            logger.debug(f"Processing message: {review_data}")
            result = self.predictor.predict_sentiment(review_data)
            logger.info(f"Processed review ID: {review_data.get('reviewId', 'unknown')}, "
                        f"Sentiment: {result.get('sentiment', 'unknown')}")

            # Save to MongoDB
            if self.mongo_collection:
                to_insert = {**review_data, **result}
                self.mongo_collection.insert_one(to_insert)
                logger.debug(f"Inserted into MongoDB: {to_insert}")

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
                logger.debug(f"Processed message: {processed_message}")
        except KeyboardInterrupt:
            logger.info("Consumption interrupted by user")
        except Exception as e:
            logger.error(f"Error during consumption: {str(e)}")
        finally:
            self.shutdown()

    def shutdown(self):
        """Shutdown the consumer, predictor, and database connection."""
        logger.info("Shutting down consumer...")
        if self.consumer:
            self.consumer.close()

        if self.predictor:
            self.predictor.shutdown()

        if self.mongo_client:
            self.mongo_client.close()
            logger.info("MongoDB connection closed.")

if __name__ == "__main__":
    consumer = SentimentConsumer()
    consumer.start_consuming()
