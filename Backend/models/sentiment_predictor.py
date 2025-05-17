import pickle
import os
import re
import nltk
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer

# Télécharger les ressources NLTK nécessaires
nltk.download('punkt')
nltk.download('stopwords')
nltk.download('wordnet')

class SentimentPredictor:
    def __init__(self, model_path=None):
        if model_path is None:
            model_path = os.path.join(os.path.dirname(__file__), '../../models/sentiment_model.pkl')
            vectorizer_path = os.path.join(os.path.dirname(__file__), '../../models/tfidf_vectorizer.pkl')
        
        # Charger les modèles s'ils existent, sinon utiliser un modèle fictif pour le développement
        try:
            with open(model_path, 'rb') as f:
                self.model = pickle.load(f)
            with open(vectorizer_path, 'rb') as f:
                self.vectorizer = pickle.load(f)
            self.model_loaded = True
        except FileNotFoundError:
            print("Modèles non trouvés. Utilisation d'un modèle fictif pour le développement.")
            self.model_loaded = False
        
        # Initialiser les outils de prétraitement
        self.stop_words = set(stopwords.words('english'))
        self.lemmatizer = WordNetLemmatizer()
    
    def preprocess_text(self, text):
        """Prétraite le texte pour la prédiction."""
        # Convertir en minuscules
        text = text.lower()
        # Supprimer la ponctuation et les chiffres
        text = re.sub(r'[^\w\s]', '', text)
        text = re.sub(r'\d+', '', text)
        # Tokeniser
        tokens = nltk.word_tokenize(text)
        # Supprimer les stop words et lemmatiser
        tokens = [self.lemmatizer.lemmatize(token) for token in tokens if token not in self.stop_words]
        return ' '.join(tokens)
    
    def predict(self, text):
        """Prédit le sentiment d'un texte."""
        # Si le modèle n'est pas chargé, retourner une prédiction aléatoire
        if not self.model_loaded:
            # Pour le développement, utiliser la règle basée sur la longueur du texte
            import random
            return random.choice([0, 1, 2])  # 0: négatif, 1: neutre, 2: positif
        
        # Prétraiter le texte
        preprocessed_text = self.preprocess_text(text)
        
        # Vectoriser le texte
        X = self.vectorizer.transform([preprocessed_text])
        
        # Prédire le sentiment
        prediction = self.model.predict(X)[0]
        
        return prediction