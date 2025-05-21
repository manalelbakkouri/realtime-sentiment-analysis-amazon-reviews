
import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from "@/hooks/use-toast";
import { SentimentPrediction } from '@/components/ReviewsTable';
import { flaskApiService } from '@/services/flaskApiService';
import { REFRESH_INTERVAL, API_URL, USE_MOCK_API } from '@/services/apiConfig';

export const useMongoSentiment = () => {
  const [predictions, setPredictions] = useState<SentimentPrediction[]>([]);
  const [stats, setStats] = useState<any>({
    total_count: 0,
    sentiment_counts: { positive: 0, neutral: 0, negative: 0 },
    sentiment_percentages: { positive: 0, neutral: 0, negative: 0 },
    processedToday: 0,
    accuracyRate: 0,
    avgProcessingTime: "0s"
  });
  const [timeline, setTimeline] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any>({
    topPositive: [],
    topNegative: []
  });
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Référence au WebSocket
  const wsRef = useRef<WebSocket | null>(null);

  // Fonction pour charger les données via API REST
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // Charger les prédictions
      const predictionsData = await flaskApiService.fetchPredictions(10);
      setPredictions(predictionsData);
      
      // Charger les statistiques
      const statsData = await flaskApiService.fetchSentimentStats();
      setStats({
        ...statsData,
        processedToday: statsData.total_count || 0,
        accuracyRate: 0.94,
        avgProcessingTime: "0.31s"
      });
      
      // Charger la timeline
      const timelineData = await flaskApiService.fetchSentimentTimeline();
      setTimeline(timelineData);
      
      // Charger les top produits
      const productsData = await flaskApiService.fetchTopProducts();
      setTopProducts(productsData);
      
      setError(null);
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
      setError("Impossible de charger les données depuis le serveur");
      toast({
        title: "Erreur de chargement",
        description: "Impossible de charger les données depuis le serveur",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Fonction pour se connecter au WebSocket pour les mises à jour en temps réel
  const connectWebSocket = useCallback(() => {
    // Ne pas essayer de connecter un WebSocket en mode mock
    if (USE_MOCK_API) return;
    
    // Construire l'URL WebSocket (ws:// ou wss://)
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    let wsUrl;
    
    if (API_URL.startsWith('http://localhost')) {
      wsUrl = 'ws://localhost:5000/ws';
    } else if (API_URL.startsWith('http://')) {
      wsUrl = API_URL.replace('http://', 'ws://') + '/ws';
    } else if (API_URL.startsWith('https://')) {
      wsUrl = API_URL.replace('https://', 'wss://') + '/ws';
    } else {
      wsUrl = `${protocol}//${window.location.host}${API_URL}/ws`;
    }

    // Fermer l'ancienne connexion si elle existe
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.close();
    }
    
    try {
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        console.log('Connexion WebSocket établie');
        setConnected(true);
        toast({
          title: "Connexion établie",
          description: "Réception des données en temps réel",
        });
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'prediction') {
            // Ajouter une nouvelle prédiction au début de la liste
            setPredictions(prev => [data.prediction, ...prev.slice(0, 9)]);
            
            // Mettre à jour les statistiques si fournies
            if (data.stats) {
              setStats(data.stats);
            }
          } 
          else if (data.type === 'stats_update') {
            setStats(data.stats);
          }
        } catch (err) {
          console.error('Erreur lors du traitement des données WebSocket:', err);
        }
      };
      
      ws.onclose = () => {
        console.log('Connexion WebSocket fermée');
        setConnected(false);
        // Tentative de reconnexion après 5 secondes
        setTimeout(() => {
          if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
            connectWebSocket();
          }
        }, 5000);
      };
      
      ws.onerror = (error) => {
        console.error('Erreur WebSocket:', error);
        setConnected(false);
        setError("Connexion en temps réel perdue");
      };
      
      wsRef.current = ws;
      
    } catch (error) {
      console.error('Erreur lors de la création du WebSocket:', error);
      setConnected(false);
      setError("Impossible d'établir une connexion en temps réel");
    }
  }, [toast]);

  // Effet pour charger les données au chargement et périodiquement
  useEffect(() => {
    // Charger les données immédiatement
    loadData();
    
    // Établir la connexion WebSocket si disponible
    connectWebSocket();

    // Configurer la récupération périodique des données en cas d'échec du WebSocket
    const interval = setInterval(() => {
      // Si nous sommes en mode mock OU si WebSocket n'est pas connecté, rafraîchir avec API REST
      if (USE_MOCK_API || !connected) {
        loadData();
      }
    }, REFRESH_INTERVAL);

    return () => {
      // Nettoyer l'intervalle et la connexion WebSocket
      clearInterval(interval);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [loadData, connectWebSocket, connected]);

  // Fonction pour prédire le sentiment d'un texte personnalisé
  const predictSentiment = async (text: string) => {
    try {
      // Envoyer une requête au service pour prédire le sentiment
      const predictionResult = await flaskApiService.predictSentiment(text);
      
      // Créer un nouvel objet SentimentPrediction
      const newPrediction: SentimentPrediction = {
        _id: Date.now().toString(),
        text,
        sentiment: predictionResult.sentiment || "neutral",
        prediction: predictionResult.confidence || 0.5,
        confidence: predictionResult.confidence || 0.5,
        probabilities: predictionResult.probabilities || [0.3, 0.3, 0.4],
        timestamp: new Date().toISOString()
      };
      
      // Ajouter la nouvelle prédiction au début de la liste
      setPredictions(prev => [newPrediction, ...prev.slice(0, 9)]);
      
      return { 
        success: true, 
        prediction: newPrediction
      };
    } catch (error) {
      console.error("Erreur lors de la prédiction:", error);
      return {
        success: false,
        error: "Échec de la prédiction du sentiment"
      };
    }
  };

  return { 
    predictions, 
    stats, 
    timeline, 
    topProducts, 
    loading,
    connected,
    error,
    predictSentiment,
    refreshData: loadData
  };
};
