import React, { useState, useEffect } from 'react';
import axios from 'axios';

function RealTimeStream() {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // URL de l'API (même conteneur => localhost)
  const API_BASE_URL = 'http://localhost:5000';

  const fetchLatestPredictions = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/predictions?t=${new Date().getTime()}`);
      
      if (Array.isArray(response.data)) {
        const latestPredictions = response.data.slice(-10).reverse();
        setPredictions(latestPredictions);
      } else {
        console.warn("La réponse n'est pas un tableau:", response.data);
        setPredictions([]);
      }

      setLoading(false);
      setError(null);
    } catch (err) {
      console.error("Erreur lors de la récupération des données:", err);
      setError(`Erreur lors de la récupération des données: ${err.message}`);
      setLoading(false);

      try {
        const testResponse = await axios.get(`${API_BASE_URL}/api/predictions/test`);
        console.log("Test API response:", testResponse.data);
      } catch (testErr) {
        console.error("L'API n'est pas accessible:", testErr);
      }
    }
  };

  useEffect(() => {
    fetchLatestPredictions();
    const interval = setInterval(() => {
      fetchLatestPredictions();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const getSentimentClass = (sentiment) => {
    switch (sentiment) {
      case 'negative':
        return 'sentiment-negative';
      case 'neutral':
        return 'sentiment-neutral';
      case 'positive':
        return 'sentiment-positive';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  if (loading && predictions.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Erreur!</strong>
        <span className="block sm:inline"> {error}</span>
        <p className="mt-2">
          <button 
            onClick={fetchLatestPredictions}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-sm"
          >
            Réessayer
          </button>
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-6">Flux de Prédictions en Temps Réel</h2>

      {predictions.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-gray-500">Aucune prédiction disponible pour le moment.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="py-3 px-4 bg-gray-100 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">ID</th>
                <th className="py-3 px-4 bg-gray-100 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Produit (ASIN)</th>
                <th className="py-3 px-4 bg-gray-100 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Texte</th>
                <th className="py-3 px-4 bg-gray-100 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Sentiment</th>
                <th className="py-3 px-4 bg-gray-100 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Horodatage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {predictions.map((prediction, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="py-4 px-4 text-sm text-gray-500">{prediction.reviewID || 'N/A'}</td>
                  <td className="py-4 px-4 text-sm text-gray-500">{prediction.asin || 'N/A'}</td>
                  <td className="py-4 px-4 text-sm text-gray-500">
                    {prediction.text 
                      ? (prediction.text.length > 100 
                          ? `${prediction.text.substring(0, 100)}...` 
                          : prediction.text)
                      : 'N/A'}
                  </td>
                  <td className="py-4 px-4 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs ${getSentimentClass(prediction.sentiment)}`}>
                      {prediction.sentiment || 'unknown'}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500">
                    {prediction.timestamp 
                      ? new Date(prediction.timestamp).toLocaleString() 
                      : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-4 text-right">
        <button 
          onClick={fetchLatestPredictions}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Rafraîchir
        </button>
      </div>
    </div>
  );
}

export default RealTimeStream;
