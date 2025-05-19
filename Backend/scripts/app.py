from flask import Flask, request, jsonify
import json
import logging
from models.sentiment_predictor import SentimentPredictor
from scripts.kafka_producer import ReviewProducer
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Initialize and attach to app
predictor = SentimentPredictor()
producer = ReviewProducer()
app.predictor = predictor
app.producer = producer

@app.route('/')
def index():
    return 'Sentiment API is running!', 200

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({"status": "ok"}), 200

@app.route('/predict', methods=['POST'])
def predict():
    """
    Endpoint to predict sentiment directly.
    Expected input: { "text": "I love this product!" }
    """
    try:
        review_data = request.json
        
        if not review_data or 'text' not in review_data:
            return jsonify({"error": "Missing 'text' field in review data."}), 400
        
        logger.info("Received review for prediction: %s", review_data.get("text", "")[:100])
        result = app.predictor.predict_sentiment(review_data)
        return jsonify(result), 200

    except Exception as e:
        logger.error(f"Error processing request: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/submit', methods=['POST'])
def submit_review():
    """
    Submit a review to Kafka for asynchronous processing.
    Expected input: { "reviewId": "123", "text": "Some text here" }
    """
    try:
        review_data = request.json
        
        if not review_data or 'text' not in review_data:
            return jsonify({"error": "Missing 'text' field in review data."}), 400
        
        logger.info("Submitting review to Kafka: %s", review_data.get("reviewId", "unknown"))
        app.producer.send_review(review_data)
        
        return jsonify({
            "message": "Review submitted for processing",
            "reviewId": review_data.get("reviewId", "unknown")
        }), 202

    except Exception as e:
        logger.error(f"Error submitting review: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/batch', methods=['POST'])
def batch_predict():
    """
    Predict sentiment for a batch of reviews.
    Expected input: [ {"text": "Good"}, {"text": "Bad"} ]
    """
    try:
        reviews = request.json
        
        if not reviews or not isinstance(reviews, list):
            return jsonify({"error": "Invalid batch data. Expected a list of review objects."}), 400
        
        for r in reviews:
            if 'text' not in r:
                return jsonify({"error": "Each review must contain a 'text' field."}), 400

        logger.info("Processing batch of %d reviews", len(reviews))
        results = app.predictor.predict_batch(reviews)
        return jsonify(results), 200

    except Exception as e:
        logger.error(f"Error processing batch: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.teardown_appcontext
def shutdown_resources(exception=None):
    """Clean up resources when the application context ends."""
    if hasattr(app, 'predictor') and app.predictor:
        app.predictor.shutdown()

    if hasattr(app, 'producer') and app.producer:
        app.producer.shutdown()

if __name__ == "__main__":
    try:
        logger.info("Starting Sentiment API server...")
        app.run(host='0.0.0.0', port=5000, debug=False)
    except Exception as e:
        logger.error(f"Fatal error: {e}")
    finally:
        logger.info("Shutting down resources...")
        predictor.shutdown()
        producer.shutdown()
