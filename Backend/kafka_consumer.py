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
                'amazon-reviews',
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
