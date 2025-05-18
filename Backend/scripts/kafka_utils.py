# scripts/kafka_utils.py

import json
import time
from kafka import KafkaProducer


def send_reviews(count, interval, servers):
    try:
        producer = KafkaProducer(
            bootstrap_servers=servers,
            value_serializer=lambda x: json.dumps(x).encode('utf-8')
        )

        for i in range(count):
            message = {
                'review_id': i,
                'reviewText': f"Ceci est un commentaire de test n°{i}",
                'overall': 5,
                'asin': 'B00004Y2UT',
                'reviewerID': f'user_{i}',
            }
            producer.send('amazon-reviews', value=message)
            print(f"[Producer] Envoyé : {message}")
            time.sleep(interval)

        producer.flush()
        producer.close()
        return True

    except Exception as e:
        print(f"[Producer] Erreur : {e}")
        return False
