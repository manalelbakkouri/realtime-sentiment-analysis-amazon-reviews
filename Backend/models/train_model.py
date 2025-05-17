import pandas as pd
import numpy as np
import re
import nltk
import joblib
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report, f1_score
import os

# Télécharger les ressources NLTK nécessaires
nltk.download('punkt')
nltk.download('stopwords')
nltk.download('wordnet')

# Définir le chemin de sauvegarde
MODEL_OUTPUT_DIR = '../models'
os.makedirs(MODEL_OUTPUT_DIR, exist_ok=True)

def clean_text(text):
    """Nettoie le texte pour l'entraînement"""
    if not isinstance(text, str):
        return ""
    
    # Convertir en minuscules
    text = text.lower()
    # Supprimer la ponctuation et les chiffres
    text = re.sub(r'[^\w\s]', '', text)
    text = re.sub(r'\d+', '', text)
    return text

def train_model(data_path):
    """
    Entraîne et exporte le modèle de classification de sentiments.
    
    Args:
        data_path (str): Chemin vers le fichier de données JSON
    """
    print(f"Chargement des données depuis {data_path}...")
    # Charger les données
    df = pd.read_json(data_path, lines=True)
    
    # Prétraiter les données
    print("Prétraitement des données...")
    df = df[['reviewText', 'overall']].dropna()
    
    # Créer le label (0 = négatif, 1 = neutre, 2 = positif)
    df['label'] = df['overall'].apply(lambda x: 0 if x < 3 else (1 if x == 3 else 2))
    
    # Nettoyer le texte
    df['text_clean'] = df['reviewText'].apply(clean_text)
    
    # Diviser les données
    print("Division des données en train/validation/test...")
    X = df['text_clean']
    y = df['label']
    
    X_train, X_temp, y_train, y_temp = train_test_split(X, y, test_size=0.2, random_state=42)
    X_val, X_test, y_val, y_test = train_test_split(X_temp, y_temp, test_size=0.5, random_state=42)
    
    # Créer le pipeline
    print("Création du pipeline TF-IDF + LogisticRegression...")
    pipeline = Pipeline([
        ('tfidf', TfidfVectorizer(
            lowercase=True,
            stop_words='english',
            token_pattern=r'\b[a-zA-Z]{2,}\b',
            max_features=7000
        )),
        ('clf', LogisticRegression(
            multi_class='multinomial',
            solver='lbfgs',
            max_iter=100,
            C=1.0,
            class_weight='balanced'
        ))
    ])
    
    # Entraîner le modèle
    print("Entraînement du modèle...")
    pipeline.fit(X_train, y_train)
    
    # Évaluer sur la validation
    val_pred = pipeline.predict(X_val)
    val_f1 = f1_score(y_val, val_pred, average='weighted')
    print(f"Score F1 sur validation : {val_f1:.4f}")
    
    # Évaluer sur le test
    test_pred = pipeline.predict(X_test)
    test_f1 = f1_score(y_test, test_pred, average='weighted')
    print(f"Score F1 sur test : {test_f1:.4f}")
    print("\nRapport de classification sur les données de test:")
    print(classification_report(y_test, test_pred, target_names=['Négatif', 'Neutre', 'Positif']))
    
    # Exporter le pipeline complet
    print(f"Exportation du modèle vers {MODEL_OUTPUT_DIR}...")
    joblib.dump(pipeline, os.path.join(MODEL_OUTPUT_DIR, 'sentiment_model.pkl'))
    
    # Optionnel: exporter séparément le vectoriseur et le modèle
    joblib.dump(pipeline.named_steps['tfidf'], os.path.join(MODEL_OUTPUT_DIR, 'tfidf_vectorizer.pkl'))
    joblib.dump(pipeline.named_steps['clf'], os.path.join(MODEL_OUTPUT_DIR, 'sentiment_classifier.pkl'))
    
    print("Modèle entraîné et exporté avec succès!")
    
    # Démonstration avec quelques exemples
    examples = [
        "This product is amazing, I love it!",
        "It's okay, nothing special.",
        "Terrible purchase, completely disappointed."
    ]
    
    print("\nTest avec quelques exemples:")
    for example in examples:
        pred = pipeline.predict([example])[0]
        proba = pipeline.predict_proba([example])[0]
        sentiment = ['Négatif', 'Neutre', 'Positif'][pred]
        confidence = proba[pred]
        print(f"Texte: \"{example}\"")
        print(f"Prédiction: {sentiment} (confiance: {confidence:.2f})")
        print(f"Probabilités: {proba}\n")

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='Entraîner et exporter un modèle de sentiment')
    parser.add_argument('--data', type=str, required=True, help='Chemin vers le fichier de données JSON')
    
    args = parser.parse_args()
    train_model(args.data)