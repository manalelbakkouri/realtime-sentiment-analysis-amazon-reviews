import os

def get_bootstrap_servers():
    """Get Kafka bootstrap servers from environment variables or use default.
    
    Returns:
        String with comma-separated list of Kafka bootstrap servers
    """
    return os.environ.get('KAFKA_BOOTSTRAP_SERVERS', 'localhost:9092')

def get_topic_name(default_name="reviews"):
    """Get Kafka topic name from environment variables or use default.
    
    Args:
        default_name: Default topic name to use if not specified in environment
        
    Returns:
        String with Kafka topic name
    """
    return os.environ.get('KAFKA_TOPIC', default_name)

def get_consumer_group(default_group="sentiment-consumer"):
    """Get Kafka consumer group from environment variables or use default.
    
    Args:
        default_group: Default consumer group to use if not specified in environment
        
    Returns:
        String with Kafka consumer group
    """
    return os.environ.get('KAFKA_CONSUMER_GROUP', default_group)