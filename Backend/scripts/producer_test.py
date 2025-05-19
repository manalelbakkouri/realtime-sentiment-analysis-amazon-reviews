import sys
import os
import json
import time
import argparse

# Add the parent directory to sys.path to import the modules
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from scripts.kafka_producer import ReviewProducer

def parse_args():
    parser = argparse.ArgumentParser(description="Test the Kafka producer with sample reviews")
    parser.add_argument("--count", type=int, default=5, help="Number of sample reviews to send")
    parser.add_argument("--delay", type=float, default=1.0, help="Delay between messages in seconds")
    return parser.parse_args()

def generate_sample_reviews(count=5):
    """Generate a list of sample reviews for testing.
    
    Args:
        count: Number of sample reviews to generate
        
    Returns:
        List of sample review dictionaries
    """
    samples = [
        {
            "reviewText": "This product exceeded my expectations. The quality is excellent and it works perfectly.",
            "summary": "Excellent product, highly recommended",
            "overall": 5.0
        },
        {
            "reviewText": "Good product for the price. Does what it says it will do, but nothing extraordinary.",
            "summary": "Good value for money",
            "overall": 4.0
        },
        {
            "reviewText": "It's okay. Not great, not terrible. Does the job but there are better options.",
            "summary": "Average product",
            "overall": 3.0
        },
        {
            "reviewText": "Disappointed with this purchase. Product quality is poor and doesn't last long.",
            "summary": "Poor quality, wouldn't recommend",
            "overall": 2.0
        },
        {
            "reviewText": "Terrible product. Complete waste of money. Don't buy this under any circumstances.",
            "summary": "Awful, avoid at all costs",
            "overall": 1.0
        }
    ]
    
    # Generate the requested number of reviews by cycling through the samples
    result = []
    for i in range(count):
        result.append(samples[i % len(samples)])
    
    return result

def main():
    args = parse_args()
    producer = ReviewProducer()
    
    try:
        print(f"Sending {args.count} sample reviews with {args.delay}s delay...")
        sample_reviews = generate_sample_reviews(args.count)
        
        for i, review in enumerate(sample_reviews):
            future = producer.send_review(review)
            future.get(timeout=10)  # Wait for the message to be sent
            print(f"Sent review {i+1}/{args.count}: {review['summary']}")
            
            if i < len(sample_reviews) - 1:
                time.sleep(args.delay)
                
        print("All sample reviews sent successfully!")
        
    except Exception as e:
        print(f"Error: {str(e)}")
    finally:
        producer.shutdown()

if __name__ == "__main__":
    main()