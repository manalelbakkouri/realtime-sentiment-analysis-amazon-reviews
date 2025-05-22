import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

function Dashboard() {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [products, setProducts] = useState([]);

  // Couleurs pour les sentiments
  const COLORS = {
    positive: '#10B981',
    neutral: '#F59E0B',
    negative: '#EF4444'
  };

  // Récupérer toutes les prédictions
  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/predictions');
        setPredictions(response.data);
        
        // Extraire la liste unique des produits (ASIN)
        const uniqueProducts = [...new Set(response.data.map(item => item.asin))];
        setProducts(uniqueProducts);
        
        // Sélectionner le premier produit par défaut
        if (uniqueProducts.length > 0 && !selectedProduct) {
          setSelectedProduct(uniqueProducts[0]);
        }
        
        setLoading(false);
      } catch (err) {
        setError('Erreur lors de la récupération des données');
        setLoading(false);
        console.error(err);
      }
    };

    fetchPredictions();
  }, []);

  // Préparer les données pour le graphique à barres
  const prepareBarChartData = () => {
    // Grouper par date (jour)
    const groupedByDate = predictions.reduce((acc, prediction) => {
      const date = new Date(prediction.timestamp).toLocaleDateString();
      
      if (!acc[date]) {
        acc[date] = { date, positive: 0, neutral: 0, negative: 0 };
      }
      
      acc[date][prediction.sentiment] += 1;
      
      return acc;
    }, {});
    
    // Convertir en tableau pour Recharts
    return Object.values(groupedByDate);
  };

  // Préparer les données pour le graphique circulaire
  const preparePieChartData = () => {
    if (!selectedProduct) return [];
    
    // Filtrer les prédictions pour le produit sélectionné
    const productPredictions = predictions.filter(p => p.asin === selectedProduct);
    
    // Compter les sentiments
    const sentimentCounts = productPredictions.reduce((acc, prediction) => {
      if (!acc[prediction.sentiment]) {
        acc[prediction.sentiment] = 0;
      }
      
      acc[prediction.sentiment] += 1;
      
      return acc;
    }, {});
    
    // Convertir en tableau pour Recharts
    return Object.entries(sentimentCounts).map(([name, value]) => ({ name, value }));
  };

  if (loading) {
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
      </div>
    );
  }

  const barChartData = prepareBarChartData();
  const pieChartData = preparePieChartData();

  return (
    <div className="space-y-6">
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-6">Résultat des prédictions par date</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={barChartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="negative" stackId="a" fill={COLORS.negative} name="Négatif" />
              <Bar dataKey="neutral" stackId="a" fill={COLORS.neutral} name="Neutre" />
              <Bar dataKey="positive" stackId="a" fill={COLORS.positive} name="Positif" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-6">Scoring relatif au produit</h2>
        
        <div className="mb-4">
          <label htmlFor="product-select" className="block text-sm font-medium text-gray-700">
            Sélectionner un produit (ASIN)
          </label>
          <select
            id="product-select"
            value={selectedProduct || ''}
            onChange={(e) => setSelectedProduct(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            {products.map((product) => (
              <option key={product} value={product}>
                {product}
              </option>
            ))}
          </select>
        </div>
        
        <div className="h-80 flex justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#000000'} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-6">Statistiques Globales</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-100 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-green-800">Avis Positifs</h3>
            <p className="text-3xl font-bold text-green-600">
              {predictions.filter(p => p.sentiment === 'positive').length}
            </p>
          </div>
          <div className="bg-yellow-100 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-yellow-800">Avis Neutres</h3>
            <p className="text-3xl font-bold text-yellow-600">
              {predictions.filter(p => p.sentiment === 'neutral').length}
            </p>
          </div>
          <div className="bg-red-100 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-red-800">Avis Négatifs</h3>
            <p className="text-3xl font-bold text-red-600">
              {predictions.filter(p => p.sentiment === 'negative').length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;