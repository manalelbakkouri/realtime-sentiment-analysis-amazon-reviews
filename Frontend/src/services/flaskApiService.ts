
import { API_URL, USE_MOCK_API } from './apiConfig';
import { mockPredictions, mockStats, mockTimeline, mockTopProducts } from './mockMongoApi';
import { SentimentPrediction } from '@/components/ReviewsTable';

/**
 * Service pour se connecter au backend Flask
 */
export const flaskApiService = {
  // Récupérer les prédictions récentes
  fetchPredictions: async (limit: number = 10): Promise<SentimentPrediction[]> => {
    if (USE_MOCK_API) {
      console.log('Utilisation des données de prédiction simulées');
      return Promise.resolve(mockPredictions);
    }
    
    try {
      const response = await fetch(`${API_URL}/predictions?limit=${limit}`);
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erreur lors de la récupération des prédictions:', error);
      throw error;
    }
  },
  
  // Récupérer les statistiques de sentiment
  fetchSentimentStats: async () => {
    if (USE_MOCK_API) {
      console.log('Utilisation des statistiques simulées');
      return Promise.resolve(mockStats);
    }
    
    try {
      const response = await fetch(`${API_URL}/stats`);
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      throw error;
    }
  },
  
  // Récupérer l'évolution des sentiments dans le temps
  fetchSentimentTimeline: async () => {
    if (USE_MOCK_API) {
      console.log('Utilisation de la timeline simulée');
      return Promise.resolve(mockTimeline);
    }
    
    try {
      const response = await fetch(`${API_URL}/timeline`);
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erreur lors de la récupération de la timeline:', error);
      throw error;
    }
  },
  
  // Récupérer les top produits
  fetchTopProducts: async () => {
    if (USE_MOCK_API) {
      console.log('Utilisation des produits simulés');
      return Promise.resolve(mockTopProducts);
    }
    
    try {
      const response = await fetch(`${API_URL}/top-products`);
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erreur lors de la récupération des top produits:', error);
      throw error;
    }
  },

  // Soumettre une review pour prédiction en temps réel
  predictSentiment: async (text: string) => {
    if (USE_MOCK_API) {
      console.log('Prédiction simulée pour:', text);
      // Génération d'une prédiction aléatoire simulée
      const sentiments = ['positive', 'neutral', 'negative'];
      const sentiment = sentiments[Math.floor(Math.random() * 3)];
      const confidence = Math.random() * 0.5 + 0.5; // Entre 0.5 et 1.0
      
      return Promise.resolve({
        sentiment,
        confidence,
        probabilities: [0.1, 0.2, 0.7]
      });
    }
    
    try {
      const response = await fetch(`${API_URL}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text })
      });
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erreur lors de la prédiction:', error);
      throw error;
    }
  }
};

export default flaskApiService;
