from kafka import KafkaProducer
import json
import time
import pandas as pd
import argparse

def json_serializer(data):
    return json.dumps(data).encode('utf-8')

def send_reviews_to_kafka(file_path, topic_name='amazon-reviews', bootstrap_servers=['localhost:9092'], batch_size=100, delay=0.5):
    # Créer le producer Kafka
    producer = KafkaProducer(
        bootstrap_servers=bootstrap_servers,
        value_serializer=json_serializer
    )
    
    # Charger les données
    print(f"Chargement des données depuis {file_path}...")
    try:
        df = pd.read_json(file_path, lines=True)
    except Exception as e:
        print(f"Erreur lors du chargement des données: {e}")
        return
    
    # Utiliser seulement 10% des données pour le test comme demandé dans le projet
    test_size = int(len(df) * 0.1)
    df_test = df.iloc[-test_size:]
    
    print(f"Envoi de {len(df_test)} avis à Kafka...")
    
    # Envoyer les avis un par un avec un délai
    count = 0
    for _, row in df_test.iterrows():
        review = row.to_dict()
        
        # Convertir les types de données non sérialisables
        for key, value in review.items():
            if pd.isna(value):
                review[key] = None
        
        # Envoyer l'avis à Kafka
        producer.send(topic_name, review)
        
        count += 1
        if count % batch_size == 0:
            print(f"Envoyé {count}/{len(df_test)} avis")
        
        # Attendre avant d'envoyer le prochain avis
        time.sleep(delay)
    
    # Assurer que tous les messages sont envoyés
    producer.flush()
    print(f"Terminé ! {count} avis ont été envoyés à Kafka.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Envoyer des avis Amazon à Kafka')
    parser.add_argument('--file', type=str, required=True, help='Chemin vers le fichier de données JSON')
    parser.add_argument('--topic', type=str, default='amazon-reviews', help='Nom du topic Kafka')
    parser.add_argument('--bootstrap', type=str, default='localhost:9092', help='Serveur bootstrap Kafka')
    parser.add_argument('--batch', type=int, default=100, help='Taille du lot pour les logs')
    parser.add_argument('--delay', type=float, default=0.5, help='Délai entre les envois (secondes)')
    
    args = parser.parse_args()
    
    send_reviews_to_kafka(
        file_path=args.file,
        topic_name=args.topic,
        bootstrap_servers=[args.bootstrap],
        batch_size=args.batch,
        delay=args.delay
    )