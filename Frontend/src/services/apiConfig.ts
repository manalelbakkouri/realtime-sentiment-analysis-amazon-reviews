
/**
 * Configuration de l'API pour accéder au backend Flask et MongoDB
 */

// Vérifier si nous sommes en mode développement
const isDev = import.meta.env.MODE === 'development';

// URL de l'API Flask
export const API_URL = isDev 
  ? 'http://localhost:5000/api' // URL de développement local pour Flask
  : '/api'; // URL de production (même domaine)

// Mode simulé (utilise des données locales au lieu de l'API)
// Mettre à false pour se connecter au backend réel
export const USE_MOCK_API = false;

// Délai de rafraîchissement des données en millisecondes
export const REFRESH_INTERVAL = 3000; // 3 secondes (plus rapide pour le temps réel)

// Configuration spécifique à MongoDB
export const MONGO_CONFIG = {
  database: 'sentiment_analysis',
  collection: 'predictions'
};
