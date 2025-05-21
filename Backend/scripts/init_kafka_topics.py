from kafka.admin import KafkaAdminClient, NewTopic
import time
import sys

def create_topics():
    """Crée les topics Kafka nécessaires pour l'application"""
    retries = 0
    max_retries = 10
    
    while retries < max_retries:
        try:
            print("Tentative de connexion à Kafka...")
            admin_client = KafkaAdminClient(
                bootstrap_servers=['localhost:9092'],
                client_id='admin-client'
            )
            
            # Définir les topics à créer
            topic_list = [
                NewTopic(
                    name="amazon-reviews",
                    num_partitions=1,
                    replication_factor=1
                )
            ]
            
            # Créer les topics
            admin_client.create_topics(new_topics=topic_list, validate_only=False)
            print("Topics Kafka créés avec succès!")
            admin_client.close()
            return True
            
        except Exception as e:
            retries += 1
            print(f"Erreur lors de la création des topics: {e}")
            print(f"Tentative {retries}/{max_retries}. Nouvelle tentative dans 5 secondes...")
            time.sleep(5)
    
    print("Échec de la création des topics Kafka après plusieurs tentatives.")
    return False

if __name__ == "__main__":
    print("Initialisation des topics Kafka...")
    success = create_topics()
    sys.exit(0 if success else 1)
