from kafka import KafkaProducer
import json
import time
import random
import argparse

# Exemples d'avis pour les tests
SAMPLE_REVIEWS = [
    {
        "reviewText": "This product is amazing! I love everything about it. The quality is outstanding and it works perfectly.",
        "overall": 5.0,
        "summary": "Excellent product",
    },
    {
        "reviewText": "It's okay, nothing special. Works as expected but doesn't have any standout features.",
        "overall": 3.0,
        "summary": "Average product",
    },
    {
        "reviewText": "Terrible purchase. Broke after a week. Customer service was unhelpful. Would not recommend.",
        "overall": 1.0,
        "summary": "Disappointing",
    },
    {
        "reviewText": "Good product for the price. Not perfect but does the job well enough.",
        "overall": 4.0,
        "summary": "Good value",
    },
    {
        "reviewText": "I'm not satisfied with this purchase. The quality is lower than expected.",
        "overall": 2.0,
        "summary": "Below expectations",
    }
]

def generate_review():
    """Génère un avis aléatoire pour les tests"""
    review = random.choice(SAMPLE_REVIEWS).copy()
    
    # Ajouter des champs supplémentaires
    review.update({
        "reviewerID": f"user_{random.randint(1000, 9999)}",
        "asin": f"product_{random.randint(1000, 9999)}",
        "unixReviewTime": int(time.time()),
        "reviewTime": time.strftime("%Y-%m-%d", time.localtime()),
    })
    
    return review

def send_reviews(num_reviews, interval):
    """Envoie des avis au topic Kafka"""
    try:
        # Créer le producer Kafka
        producer = KafkaProducer(
            bootstrap_servers=['localhost:9092'],
            value_serializer=lambda v: json.dumps(v).encode('utf-8')
        )
        
        print(f"Envoi de {num_reviews} avis au topic 'amazon-reviews'...")
        
        for i in range(num_reviews):
            # Générer un avis aléatoire
            review = generate_review()
            
            # Envoyer l'avis au topic Kafka
            producer.send('amazon-reviews', review)
            
            print(f"Avis {i+1}/{num_reviews} envoyé: {review['summary']} - {review['overall']} étoiles")
            
            # Attendre l'intervalle spécifié
            if i < num_reviews - 1:
                time.sleep(interval)
        
        # Assurer que tous les messages sont envoyés
        producer.flush()
        print("Tous les avis ont été envoyés avec succès!")
        
    except Exception as e:
        print(f"Erreur lors de l'envoi des avis: {e}")
    finally:
        if 'producer' in locals():
            producer.close()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Envoyer des avis de test au topic Kafka')
    parser.add_argument('--count', type=int, default=10, help='Nombre d\'avis à envoyer')
    parser.add_argument('--interval', type=float, default=1.0, help='Intervalle entre les envois (en secondes)')
    
    args = parser.parse_args()
    send_reviews(args.count, args.interval)
