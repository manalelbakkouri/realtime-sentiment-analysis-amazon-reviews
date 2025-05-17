from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_socketio import SocketIO
from pymongo import MongoClient
import os
from dotenv import load_dotenv
from datetime import datetime
import json

# Import des modules personnalisés
from kafka_consumer import start_consumer_thread
from models.sentiment_predictor import SentimentPredictor

# Charger les variables d'environnement
load_dotenv()

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

# Configuration MongoDB
mongo_client = MongoClient('mongodb://mongodb:27017/')
db = mongo_client['amazon_reviews']
reviews_collection = db['reviews']
predictions_collection = db['predictions']

# Charger le modèle de prédiction
predictor = SentimentPredictor()

@app.route('/api/status', methods=['GET'])
def status():
    return jsonify({"status": "API is running"})

@app.route('/api/reviews', methods=['GET'])
def get_reviews():
    limit = int(request.args.get('limit', 100))
    reviews = list(reviews_collection.find({}).limit(limit))
    
    # Convertir ObjectId en str pour la sérialisation JSON
    for review in reviews:
        review['_id'] = str(review['_id'])
    
    return jsonify(reviews)

@app.route('/api/predictions', methods=['GET'])
def get_predictions():
    limit = int(request.args.get('limit', 100))
    predictions = list(predictions_collection.find({}).limit(limit))
    
    # Convertir ObjectId en str pour la sérialisation JSON
    for prediction in predictions:
        prediction['_id'] = str(prediction['_id'])
    
    return jsonify(predictions)

@app.route('/api/product/<asin>', methods=['GET'])
def get_product_reviews(asin):
    reviews = list(reviews_collection.find({"asin": asin}))
    
    # Convertir ObjectId en str pour la sérialisation JSON
    for review in reviews:
        review['_id'] = str(review['_id'])
    
    return jsonify(reviews)

@app.route('/api/analytics/sentiment', methods=['GET'])
def get_sentiment_analytics():
    pipeline = [
        {
            '$group': {
                '_id': '$sentiment',
                'count': {'$sum': 1}
            }
        }
    ]
    results = list(predictions_collection.aggregate(pipeline))
    return jsonify(results)

@app.route('/api/analytics/timeline', methods=['GET'])
def get_timeline_analytics():
    pipeline = [
        {
            '$group': {
                '_id': {
                    'date': {'$dateToString': {'format': '%Y-%m-%d', 'date': '$timestamp'}},
                    'sentiment': '$sentiment'
                },
                'count': {'$sum': 1}
            }
        },
        {
            '$sort': {'_id.date': 1}
        }
    ]
    results = list(predictions_collection.aggregate(pipeline))
    return jsonify(results)

@app.route('/api/analytics/products', methods=['GET'])
def get_product_analytics():
    pipeline = [
        {
            '$group': {
                '_id': {
                    'asin': '$asin',
                    'sentiment': '$sentiment'
                },
                'count': {'$sum': 1},
                'avg_score': {'$avg': '$overall'}
            }
        }
    ]
    results = list(predictions_collection.aggregate(pipeline))
    return jsonify(results)

@socketio.on('connect')
def handle_connect():
    print('Client connected')

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')

if __name__ == '__main__':
    # Démarrer le consumer Kafka dans un thread séparé
    start_consumer_thread(socketio, predictor, predictions_collection)
    
    # Démarrer le serveur Flask avec SocketIO
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)