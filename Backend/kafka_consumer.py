from kafka import KafkaConsumer
import json
import threading
import time
from datetime import datetime
from bson import ObjectId

def consume_messages(socketio, predictor, predictions_collection):
    consumer = KafkaConsumer(
        'amazon-reviews',
        bootstrap_servers=['kafka:9092'],
        auto_offset_reset='earliest',
        value_deserializer=lambda x: json.loads(x.decode('utf-8')),
        group_id='amazon-reviews-group'
    )
    
    print("Kafka consumer started...")
    
    for message in consumer:
        review = message.value
        
        # Prédire le sentiment
        review_text = review.get('reviewText', '')
        prediction = predictor.predict(review_text)
        
        # Déterminer le sentiment basé sur la prédiction
        if prediction == 0:
            sentiment = "negative"
        elif prediction == 1:
            sentiment = "neutral"
        else:
            sentiment = "positive"
        
        # Préparer les résultats de la prédiction
        prediction_result = {
            "reviewerID": review.get('reviewerID', ''),
            "asin": review.get('asin', ''),
            "reviewText": review_text,
            "overall": review.get('overall', 0),
            "summary": review.get('summary', ''),
            "unixReviewTime": review.get('unixReviewTime', 0),
            "reviewTime": review.get('reviewTime', ''),
            "prediction": prediction,
            "sentiment": sentiment,
            "timestamp": datetime.now()
        }
        
        # Sauvegarder dans MongoDB
        predictions_collection.insert_one(prediction_result)
        
        # Convertir ObjectId en str pour l'envoi via socketio
        prediction_result['_id'] = str(ObjectId())
        
        # Envoyer les résultats en temps réel aux clients connectés
        socketio.emit('new_prediction', prediction_result)
        
        print(f"Processed review: {prediction_result['asin']} - {sentiment}")

def start_consumer_thread(socketio, predictor, predictions_collection):
    consumer_thread = threading.Thread(
        target=consume_messages,
        args=(socketio, predictor, predictions_collection)
    )
    consumer_thread.daemon = True
    consumer_thread.start()
    return consumer_thread