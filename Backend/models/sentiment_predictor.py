import pickle
import os
import re
import nltk
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
import joblib

# Télécharger les ressources NLTK nécessaires
nltk.download('punkt', quiet=True)
nltk.download('stopwords', quiet=True)
nltk.download('wordnet', quiet=True)

class SentimentPredictor:
    def __init__(self, model_path=None, vectorizer_path=None):
        """
        Initialise le prédicteur de sentiment.
        
        Args:
            model_path (str, optional): Chemin vers le fichier du modèle ML.
            vectorizer_path (str, optional): Chemin vers le fichier du vectoriseur TF-IDF.
        """
        # Définir les chemins par défaut si non spécifiés
        if model_path is None:
            model_path = os.path.join(os.path.dirname(__file__), '../../models/sentiment_model.pkl')
        if vectorizer_path is None:
            vectorizer_path = os.path.join(os.path.dirname(__file__), '../../models/tfidf_vectorizer.pkl')
        
        # Charger les modèles s'ils existent
        try:
            # Option 1: Si vous avez exporté le pipeline complet
            if os.path.exists(model_path) and not os.path.exists(vectorizer_path):
                print("Chargement du pipeline complet...")
                self.pipeline = joblib.load(model_path)
                self.model_type = "pipeline"
                self.model_loaded = True
            # Option 2: Si vous avez exporté le vectoriseur et le modèle séparément
            elif os.path.exists(model_path) and os.path.exists(vectorizer_path):
                print("Chargement du vectoriseur et du modèle séparément...")
                self.vectorizer = joblib.load(vectorizer_path)
                self.model = joblib.load(model_path)
                self.model_type = "separate"
                self.model_loaded = True
            else:
                raise FileNotFoundError("Fichiers de modèle non trouvés")
                
        except FileNotFoundError as e:
            print(f"Erreur lors du chargement des modèles: {e}")
            print("Utilisation d'un modèle fictif pour le développement.")
            self.model_loaded = False
        
        # Initialiser les outils de prétraitement pour le nettoyage manuel si nécessaire
        self.stop_words = set(stopwords.words('english'))
        self.lemmatizer = WordNetLemmatizer()
    
    def preprocess_text(self, text):
        """
        Prétraite le texte pour la prédiction (utilisé si le pipeline n'est pas chargé).
        
        Args:
            text (str): Texte brut à prétraiter.
            
        Returns:
            str: Texte prétraité.
        """
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
        """
        Prédit le sentiment d'un texte.
        
        Args:
            text (str): Texte brut à analyser.
            
        Returns:
            int: 0 pour négatif, 1 pour neutre, 2 pour positif.
        """
        # Si le modèle n'est pas chargé, retourner une prédiction aléatoire
        if not self.model_loaded:
            import random
            return random.choice([0, 1, 2])  # 0: négatif, 1: neutre, 2: positif
        
        # Effectuer la prédiction selon le type de modèle chargé
        try:
            if self.model_type == "pipeline":
                # Le pipeline gère le prétraitement et la prédiction
                prediction = self.pipeline.predict([text])[0]
            else:
                # Prétraiter le texte manuellement
                preprocessed_text = self.preprocess_text(text)
                
                # Vectoriser le texte
                X = self.vectorizer.transform([preprocessed_text])
                
                # Prédire le sentiment
                prediction = self.model.predict(X)[0]
            
            return prediction
        except Exception as e:
            print(f"Erreur lors de la prédiction: {e}")
            # En cas d'erreur, retourner une valeur par défaut
            return 1  # Neutre par défaut
    
    def predict_proba(self, text):
        """
        Prédit les probabilités de chaque classe de sentiment.
        
        Args:
            text (str): Texte brut à analyser.
            
        Returns:
            list: Probabilités pour chaque classe [négatif, neutre, positif].
        """
        if not self.model_loaded:
            return [0.33, 0.34, 0.33]  # Probabilités équiprobables
        
        try:
            if self.model_type == "pipeline":
                # Le pipeline gère le prétraitement et la prédiction
                proba = self.pipeline.predict_proba([text])[0]
            else:
                # Prétraiter le texte manuellement
                preprocessed_text = self.preprocess_text(text)
                
                # Vectoriser le texte
                X = self.vectorizer.transform([preprocessed_text])
                
                # Prédire les probabilités
                proba = self.model.predict_proba(X)[0]
            
            return proba.tolist()
        except Exception as e:
            print(f"Erreur lors de la prédiction des probabilités: {e}")
            return [0.33, 0.34, 0.33]  # Probabilités équiprobables