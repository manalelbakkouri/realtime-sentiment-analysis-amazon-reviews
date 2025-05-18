from kafka import KafkaConsumer
import json
import time
from datetime import datetime
from pymongo import MongoClient
import joblib
import os
import sys

# Ajouter le répertoire parent au path pour les imports (si besoin)
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def consume_messages(predictor, predictions_collection, socketio=None):
    """
    Consomme les messages du topic Kafka et effectue des prédictions de sentiment.
    """
    consumer = None
    max_retries = 5
    retries = 0

    while retries < max_retries and consumer is None:
        try:
            consumer = KafkaConsumer(
                'amazon-reviews',
                bootstrap_servers=['localhost:9092'],
                auto_offset_reset='earliest',
                value_deserializer=lambda x: json.loads(x.decode('utf-8')),
                group_id='amazon-reviews-group',
            )
            print("Connexion à Kafka réussie.")
        except Exception as e:
            retries += 1
            print(f"Tentative {retries}/{max_retries} échouée : {e}")
            time.sleep(5)

    if consumer is None:
        print("Impossible de se connecter à Kafka.")
        return

    print("Kafka consumer prêt. En attente de messages...")

    for message in consumer:
        try:
            review = message.value
            review_text = review.get('reviewText', '')
            if not review_text:
                continue

            # IMPORTANT : passer une liste d'un seul élément au pipeline
            prediction = predictor.predict([review_text])[0]

            try:
                probabilities = predictor.predict_proba([review_text])[0].tolist()
                confidence = max(probabilities)
            except Exception:
                probabilities = None
                confidence = None

            sentiment = ["negative", "neutral", "positive"][prediction]

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

            # Enregistrement dans MongoDB
            predictions_collection.insert_one(prediction_result)

            conf_str = f"{confidence:.2f}" if confidence is not None else "N/A"
            print(f"Avis traité : {sentiment} (confidence={conf_str})")

        except Exception as e:
            print(f"Erreur lors du traitement : {e}")

if __name__ == "__main__":
    print("Initialisation du Consumer Kafka...")

    # Charger le pipeline complet
    model_path = "./models/sentiment_model.pkl"  # Chemin à adapter si besoin
    if not os.path.exists(model_path):
        print(f"Modèle introuvable à {model_path}")
        sys.exit(1)

    predictor = joblib.load(model_path)  # Chargement pipeline complet

    # Connexion à MongoDB
    mongo_client = MongoClient("mongodb://mongodb:27017/")
    db = mongo_client["sentiment_db"]
    predictions_collection = db["predictions"]

    # Lancer le consumer
    consume_messages(predictor, predictions_collection)
