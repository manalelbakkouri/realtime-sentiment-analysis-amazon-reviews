# Amazon Reviews Real-Time Sentiment Analysis

<div align="center">
  <h3>🚀 Analyse des avis clients en temps réel sur des produits Amazon</h3>
  <p>Système de traitement en temps réel pour l'analyse de sentiment des commentaires clients avec Kafka, Spark et Machine Learning</p>
</div>

![Stars](https://img.shields.io/github/stars/yourusername/amazon-reviews-sentiment?style=social)
![License](https://img.shields.io/badge/license-MIT-blue)
![Python](https://img.shields.io/badge/Python-3.8+-green)
![Kafka](https://img.shields.io/badge/Apache%20Kafka-2.8+-red)
![Spark](https://img.shields.io/badge/Apache%20Spark-3.0+-orange)

## 📋 Overview

Ce projet implémente une architecture distribuée pour l'analyse de sentiment en temps réel des avis clients Amazon. Le système utilise Apache Kafka pour la diffusion de flux de données, Apache Spark pour le traitement distribué, et des modèles de Machine Learning pour classifier les sentiments (positif, négatif, neutre).

L'architecture permet de traiter les commentaires en continu et de fournir des résultats de prédiction à travers deux modes : **online** (temps réel) et **offline** (tableau de bord analytique).

## ✨ Features

- **🔄 Traitement en temps réel** : Analyse continue des avis clients avec Kafka Streaming
- **🤖 Machine Learning** : Classification automatique des sentiments avec Spark MLlib
- **📊 Tableau de bord analytique** : Visualisation des résultats et métriques de performance
- **🗄️ Stockage distribué** : Archivage des prédictions dans MongoDB
- **🐳 Containerisation** : Déploiement simplifié avec Docker
- **📈 Monitoring** : Suivi des performances et métriques en temps réel
- **🎯 Classification tri-classe** : Sentiment positif, négatif et neutre

## 🏗️ Architecture

L'architecture du projet s'articule autour des composants suivants :

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Data Source   │───▶│  Kafka Broker   │───▶│ Spark Streaming │
│   (Reviews)     │    │   + Zookeeper   │    │   + ML Models   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
                                                        ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web Dashboard │◀───│    MongoDB      │◀───│   Predictions   │
│  (Offline Mode) │    │   (Storage)     │    │  (Online Mode)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Rôle de Kafka dans l'architecture

La diffusion de flux de données s'effectue à travers plusieurs brokers Kafka. Chaque broker gère une partition d'un topic donné. Dans notre architecture, la publication et la souscription du flux des commentaires (Reviews) s'effectuent à travers un topic Kafka dédié.

## 🛠️ Technology Stack

### **Big Data & Streaming**
- **Apache Kafka** : Streaming des données en temps réel
- **Apache Zookeeper** : Gestion de configuration du cluster Kafka
- **Apache Spark** : Calcul distribué (Spark Streaming et MLlib)

### **Machine Learning & Data Processing**
- **PySpark** : Traitement de données distribuées et ML
- **TF-IDF** : Vectorisation des textes
- **Lemmatisation** : Préparation des données textuelles

### **Storage & Database**
- **MongoDB** : Base de données NoSQL pour l'archivage des prédictions

### **Development & Deployment**
- **Python** : Langage principal de développement
- **Jupyter Notebooks** : Développement et expérimentation
- **Docker** : Containerisation des composants
- **Django/Flask/JavaScript** : Interface web et tableau de bord

## 📁 Project Structure

```
amazon-reviews-sentiment/
├── Backend/
│   ├── __pycache__/
│   ├── build/
│   ├── data/
│   │   ├── mg_db/
│   │   └── DATA.json
│   ├── scripts/
│   │   ├── cleaning_stream/
│   │   ├── produce_file/
│   │   ├── spark_consumer/
│   │   └── store_predictions/
│   ├── app.py
│   ├── docker-compose.yml
│   ├── Dockerfile
│   └── requirements.txt
├── Frontend/
│   ├── build/
│   ├── node_modules/
│   ├── public/
│   └── src/
│       └── components/
│           ├── Dashboard.js
│           ├── layout.js
│           ├── Navbar.js
│           └── RealTimeStream.js
├── env310/
├── notebooks/
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Python 3.8+
- Apache Kafka 2.8+
- Apache Spark 3.0+
- MongoDB 4.4+
- Docker & Docker Compose
- Node.js 14+ (pour le frontend)

### Installation

1. **Cloner le repository**
```bash
git clone https://github.com/yourusername/amazon-reviews-sentiment
cd amazon-reviews-sentiment
```

2. **Configuration de l'environnement Python**
```bash
# Créer un environnement virtuel
python -m venv env310
source env310/bin/activate  # Linux/Mac
# ou
env310\Scripts\activate  # Windows

# Installer les dépendances
pip install -r Backend/requirements.txt
```

3. **Lancement avec Docker**
```bash
# Démarrer tous les services
docker-compose up -d

# Vérifier le statut des conteneurs
docker-compose ps
```

4. **Configuration du Frontend**
```bash
cd Frontend/frontend
npm install
npm start
```

## 📊 Interface Screenshots

### Real-Time Streaming Dashboard
![Real-time Interface](path/to/realtime-interface.png)
*Interface de streaming en temps réel montrant les prédictions de sentiment au fur et à mesure*

### Analytics Dashboard
![Analytics Dashboard](path/to/analytics-dashboard.png)
*Tableau de bord analytique avec visualisations des résultats par date/heure et scoring par produit*

## 💾 Dataset

**Source** : [Kaggle - Amazon Product Reviews](https://www.kaggle.com/code/soniaahlawat/sentiment-analysis-amazon-review/input)

### Structure des données :
- **reviewerID** : ID de l'évaluateur
- **asin** : ID du produit Amazon
- **reviewerName** : Nom de l'évaluateur
- **helpful** : Note d'utilité [x, y] : x personnes sur y ont trouvé cet avis utile
- **reviewText** : Texte complet de l'évaluation
- **overall** : Note du produit (1-5 étoiles)
- **summary** : Résumé de l'évaluation
- **unixReviewTime** : Timestamp Unix
- **reviewTime** : Date de l'évaluation

### Classification des sentiments :
- **Négatif** : overall < 3
- **Neutre** : overall = 3  
- **Positif** : overall > 3

## 🔬 Machine Learning Pipeline

1. **Préparation des données**
   - Nettoyage et lemmatisation du texte
   - Vectorisation TF-IDF
   - Partitionnement des données (80% train, 10% validation, 10% test)

2. **Entraînement des modèles**
   - Multiple algorithmes testés avec Spark MLlib
   - Validation croisée et optimisation d'hyperparamètres
   - Sélection du meilleur modèle basé sur les métriques de performance

3. **Évaluation et déploiement**
   - Test final sur 10% des données
   - Sauvegarde du modèle optimal
   - Intégration dans le pipeline de streaming

## 📈 Modes de fonctionnement

### Mode Online (Temps réel)
- Traitement continu des nouveaux avis
- Prédiction instantanée du sentiment
- Affichage en temps réel des résultats

### Mode Offline (Analytique)
- Analyse des tendances par période
- Graphiques de performance par produit
- Métriques agrégées et KPIs

## 🤝 Contributing

Les contributions sont les bienvenues ! Pour contribuer :

1. Fork le projet
2. Créez votre branche feature (`git checkout -b feature/amazing-feature`)
3. Committez vos changements (`git commit -m 'Add amazing feature'`)
4. Push vers la branche (`git push origin feature/amazing-feature`)
5. Ouvrez une Pull Request

## 📄 License

Ce projet est sous licence MIT - voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 🙏 Acknowledgments

- Kaggle pour le dataset Amazon Reviews
- Apache Foundation pour Kafka et Spark
- MongoDB pour la solution de base de données
- La communauté open-source pour les outils et bibliothèques

---

**Présenté le vendredi 23/05/2025**
