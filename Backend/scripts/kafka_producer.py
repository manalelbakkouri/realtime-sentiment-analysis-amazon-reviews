# scripts/kafka_producer.py

import sys
import os
import argparse

# Assure l'import de kafka_utils
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from scripts.kafka_utils import send_reviews  

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Envoyer des avis de test au topic Kafka')
    parser.add_argument('--count', type=int, default=10, help='Nombre d\'avis à envoyer')
    parser.add_argument('--interval', type=float, default=1.0, help='Intervalle entre les envois (en secondes)')
    parser.add_argument('--server', type=str, default='localhost:9092', help='Serveur Kafka (host:port)')
    
    args = parser.parse_args()
    success = send_reviews(args.count, args.interval, [args.server])
    sys.exit(0 if success else 1)
