from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from pymongo import MongoClient
import os
import logging
from datetime import datetime

# === Logging ===
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# === Flask App ===
app = Flask(__name__, static_folder="build", static_url_path="")
CORS(app, resources={r"/api/*": {"origins": "*"}})

# === MongoDB ===
MONGO_URI = os.getenv('MONGO_URI', 'mongodb://mongodb:27017')
DB_NAME = os.getenv('DB_NAME', 'sentiment_analysis')
COLLECTION_NAME = os.getenv('COLLECTION_NAME', 'predictions')

# app.py
is_docker = os.getenv("DOCKERIZED", "false").lower() == "true"
mongo_host = "mongodb" if is_docker else "localhost"
MONGO_URI = f"mongodb://{mongo_host}:27017"


try:
    client = MongoClient(MONGO_URI)
    db = client[DB_NAME]
    collection = db[COLLECTION_NAME]
    client.admin.command('ping')
    logger.info("Connexion à MongoDB réussie")
except Exception as e:
    logger.error(f"Erreur de connexion à MongoDB: {str(e)}")

# === API Routes ===
@app.route('/api/predictions', methods=['GET'])
def get_predictions():
    try:
        logger.info("Récupération des prédictions")
        if COLLECTION_NAME not in db.list_collection_names():
            logger.warning(f"Collection {COLLECTION_NAME} n'existe pas")
            return jsonify([])

        predictions = list(collection.find({}, {'_id': 0}))
        for pred in predictions:
            if 'timestamp' in pred and isinstance(pred['timestamp'], datetime):
                pred['timestamp'] = pred['timestamp'].isoformat()
        return jsonify(predictions)
    except Exception as e:
        logger.error(f"Erreur lors de la récupération des prédictions: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/predictions/test', methods=['GET'])
def test_api():
    return jsonify({"status": "ok", "message": "API is working"})

# === React Frontend Serve ===
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_react(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

# === Main ===
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
