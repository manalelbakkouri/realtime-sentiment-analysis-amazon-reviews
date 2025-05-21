
import { API_URL, USE_MOCK_API } from './apiConfig';
import { SentimentPrediction } from '@/components/ReviewsTable';
import { mockPredictions, mockStats, mockTimeline, mockTopProducts } from './mockMongoApi';

// Fonction pour récupérer les prédictions les plus récentes
export const fetchPredictions = async (limit = 10): Promise<SentimentPrediction[]> => {
  if (USE_MOCK_API) {
    return mockPredictions;
  }
  
  try {
    const response = await fetch(`${API_URL}/predictions?limit=${limit}`);
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }
    
    const data = await response.json();
    return data.map((item: any) => ({
      _id: item._id || item.reviewID || String(Math.random()),
      text: item.text || "",
      sentiment: item.sentiment,
      prediction: item.prediction || 0,
      confidence: item.confidence || 0,
      probabilities: item.probabilities || [0, 0, 0],
      timestamp: item.timestamp,
      reviewerID: item.reviewID || item.reviewerID,
      asin: item.asin,
      overall: item.overall,
      summary: item.summary
    }));
  } catch (error) {
    console.error("Erreur lors de la récupération des prédictions:", error);
    return [];
  }
};

// Fonction pour récupérer les statistiques générales
export const fetchSentimentStats = async () => {
  if (USE_MOCK_API) {
    return mockStats;
  }
  
  try {
    const response = await fetch(`${API_URL}/stats`);
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques:", error);
    return {
      total_count: 0,
      sentiment_counts: { positive: 0, neutral: 0, negative: 0 },
      sentiment_percentages: { positive: 0, neutral: 0, negative: 0 }
    };
  }
};

// Fonction pour récupérer la timeline des sentiments
export const fetchSentimentTimeline = async () => {
  if (USE_MOCK_API) {
    return mockTimeline;
  }
  
  try {
    const response = await fetch(`${API_URL}/timeline`);
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la récupération de la timeline:", error);
    return [];
  }
};

// Fonction pour récupérer les produits les plus notés
export const fetchTopProducts = async () => {
  if (USE_MOCK_API) {
    return mockTopProducts;
  }
  
  try {
    const response = await fetch(`${API_URL}/top-products`);
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la récupération des top produits:", error);
    return {
      topPositive: [],
      topNegative: []
    };
  }
};
