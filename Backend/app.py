from flask import Flask, request, jsonify
from flask_socketio import SocketIO
from flask_cors import CORS
from pymongo import MongoClient
import os
import json
import sys
from datetime import datetime
from bson import ObjectId, json_util

# Ajouter le répertoire parent au path pour les imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Importer les composants personnalisés
from models.sentiment_predictor import SentimentPredictor
from Backend.scripts.kafka_consumer import start_consumer_thread

# Classe pour encoder les objets MongoDB en JSON
class JSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, ObjectId):
            return str(obj)
        if isinstance(obj, datetime):
            return obj.isoformat()
        return json.JSONEncoder.default(self, obj)

# Initialiser l'application Flask
app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev_key_12345')
CORS(app, resources={r"/*": {"origins": "*"}})

# Initialiser SocketIO pour les communications en temps réel
socketio = SocketIO(app, cors_allowed_origins="*", json=JSONEncoder)

# Connexion à MongoDB
mongo_uri = os.environ.get('MONGO_URI', 'mongodb://mongodb:27017/')
mongo_client = MongoClient(mongo_uri)
db = mongo_client['amazon_reviews']
predictions_collection = db['predictions']

# Initialiser le prédicteur de sentiment
model_path = os.environ.get('MODEL_PATH', '../models/sentiment_model.pkl')
vectorizer_path = os.environ.get('VECTORIZER_PATH', '../models/tfidf_vectorizer.pkl')
predictor = SentimentPredictor(model_path, vectorizer_path)

# Route principale
@app.route('/')
def index():
    return jsonify({
        "status": "ok",
        "message": "Amazon Reviews Analysis API is running"
    })

# Route pour obtenir les prédictions récentes
@app.route('/api/predictions', methods=['GET'])
def get_predictions():
    limit = int(request.args.get('limit', 50))
    skip = int(request.args.get('skip', 0))
    
    # Récupérer les prédictions depuis MongoDB
    predictions = list(predictions_collection.find().sort(
        "timestamp", -1).skip(skip).limit(limit))
    
    # Convertir les ObjectId et datetime en format JSON
    for pred in predictions:
        pred['_id'] = str(pred['_id'])
        if 'timestamp' in pred:
            pred['timestamp'] = pred['timestamp'].isoformat()
    
    return jsonify(predictions)

# Route pour obtenir les statistiques des prédictions
@app.route('/api/stats', methods=['GET'])
def get_stats():
    # Nombre total de prédictions
    total_count = predictions_collection.count_documents({})
    
    # Répartition des sentiments
    sentiment_counts = {
        "positive": predictions_collection.count_documents({"sentiment": "positive"}),
        "neutral": predictions_collection.count_documents({"sentiment": "neutral"}),
        "negative": predictions_collection.count_documents({"sentiment": "negative"})
    }
    
    # Calcul des pourcentages
    sentiment_percentages = {}
    if total_count > 0:
        for sentiment, count in sentiment_counts.items():
            sentiment_percentages[sentiment] = round((count / total_count) * 100, 2)
    
    # Récupérer les 5 dernières prédictions
    recent_predictions = list(predictions_collection.find().sort(
        "timestamp", -1).limit(5))
    
    # Convertir les ObjectId et datetime en format JSON
    for pred in recent_predictions:
        pred['_id'] = str(pred['_id'])
        if 'timestamp' in pred:
            pred['timestamp'] = pred['timestamp'].isoformat()
    
    return jsonify({
        "total_count": total_count,
        "sentiment_counts": sentiment_counts,
        "sentiment_percentages": sentiment_percentages,
        "recent_predictions": recent_predictions
    })

# Route pour effectuer une prédiction manuelle
@app.route('/api/predict', methods=['POST'])
def predict():
    data = request.json
    
    if not data or 'text' not in data:
        return jsonify({"error": "Missing 'text' field"}), 400
    
    review_text = data['text']
    
    # Prédire le sentiment
    prediction = predictor.predict(review_text)
    
    # Obtenir les probabilités
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
    
    # Créer l'objet de résultat
    result = {
        "text": review_text,
        "prediction": int(prediction),
        "sentiment": sentiment,
        "confidence": confidence,
        "probabilities": probabilities,
        "timestamp": datetime.now().isoformat()
    }
    
    # Optionnellement sauvegarder dans MongoDB si demandé
    if data.get('save', False):
        # Ajouter des champs supplémentaires si fournis
        prediction_to_save = result.copy()
        prediction_to_save.update({
            "reviewerID": data.get('reviewerID', 'manual'),
            "asin": data.get('asin', 'manual'),
            "overall": data.get('overall', 0),
            "summary": data.get('summary', ''),
            "unixReviewTime": data.get('unixReviewTime', int(datetime.now().timestamp())),
            "reviewTime": data.get('reviewTime', datetime.now().strftime("%Y-%m-%d")),
            "processed_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        })
        
        # Convertir timestamp en objet datetime pour MongoDB
        if 'timestamp' in prediction_to_save and isinstance(prediction_to_save['timestamp'], str):
            prediction_to_save['timestamp'] = datetime.fromisoformat(prediction_to_save['timestamp'])
        
        # Sauvegarder dans MongoDB
        insert_result = predictions_collection.insert_one(prediction_to_save)
        result['_id'] = str(insert_result.inserted_id)
        
        # Émettre l'événement SocketIO
        socketio.emit('new_prediction', result)
    
    return jsonify(result)

# Route pour effacer toutes les prédictions (utile pour les tests)
@app.route('/api/predictions/clear', methods=['DELETE'])
def clear_predictions():
    if request.headers.get('X-Admin-Key') != os.environ.get('ADMIN_KEY', 'admin_secret'):
        return jsonify({"error": "Unauthorized"}), 401
    
    result = predictions_collection.delete_many({})
    return jsonify({
        "deleted_count": result.deleted_count
    })

# Événement de connexion SocketIO
@socketio.on('connect')
def handle_connect():
    print('Client connected')

# Événement de déconnexion SocketIO
@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')

# Point d'entrée principal
if __name__ == '__main__':
    # Démarrer le consumer Kafka dans un thread séparé
    consumer_thread = start_consumer_thread(socketio, predictor, predictions_collection)
    
    # Démarrer le serveur Flask avec SocketIO
    port = int(os.environ.get('PORT', 5000))
    socketio.run(app, host='0.0.0.0', port=port, debug=True)
