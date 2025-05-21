
# Sentiment Analysis Dashboard

Ce projet est une application de tableau de bord d'analyse de sentiments qui utilise Kafka, Spark, MongoDB et Flask pour traiter, stocker et visualiser les résultats d'analyse de sentiments en temps réel.

## Architecture

### Backend
- **Kafka** : Broker de messages pour la gestion des flux de données
- **MongoDB** : Base de données pour stocker les prédictions de sentiment
- **Spark** : Traitement des données et inférence du modèle ML
- **Flask** : API REST pour exposer les données au frontend

### Frontend
- **React** : Framework frontend avec Vite
- **Tailwind CSS** : Styling
- **Recharts** : Visualisation des données

## Démarrage de l'application

### Étape 1: Démarrer le backend (Kafka, MongoDB, Spark)

```bash
docker-compose up -d
```

Cela va démarrer tous les services définis dans `docker-compose.yml`:
- Zookeeper et Kafka
- MongoDB
- Spark (master et worker)
- Services de traitement (json-producer, spark-processor, spark-inference, mongo-writer)

### Étape 2: Démarrer le frontend et l'API Flask

```bash
docker-compose -f docker-compose.frontend.yml up -d
```

Cela va démarrer:
- L'API Flask qui se connecte à MongoDB
- L'application frontend React

## Accès à l'application

- **Frontend** : http://localhost:3000
- **API Flask** : http://localhost:5000/api
- **Interface Spark** : http://localhost:8080
- **MongoDB** : mongodb://localhost:27017

## Tableaux de bord disponibles

1. **Tableau de bord en temps réel** : Visualisation des données de sentiment en temps réel
2. **Tableau de bord offline** : Analyse approfondie des données historiques
3. **MongoDB Stats** : Statistiques détaillées des données stockées dans MongoDB

## Développement

Pour le développement local:

### Backend

```bash
cd backend
pip install -r requirements.txt
python app.py
```

### Frontend

```bash
npm install
npm run dev
```

Assurez-vous de définir `USE_MOCK_API=false` dans `src/services/apiConfig.ts` pour vous connecter au backend réel une fois que vous avez confirmé que le backend fonctionne correctement.
