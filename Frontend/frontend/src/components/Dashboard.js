"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"

function Dashboard() {
  const [predictions, setPredictions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [products, setProducts] = useState([])
  const [activeTab, setActiveTab] = useState("bar")

  // Couleurs pour les sentiments
  const COLORS = {
    positive: "#9333EA", // Purple
    neutral: "#F97316", // Orange
    negative: "#EF4444", // Red
  }

  // Récupérer toutes les prédictions
  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/predictions")
        setPredictions(response.data)

        // Extraire la liste unique des produits (ASIN)
        const uniqueProducts = [...new Set(response.data.map((item) => item.asin))]
        setProducts(uniqueProducts)

        // Sélectionner le premier produit par défaut
        if (uniqueProducts.length > 0 && !selectedProduct) {
          setSelectedProduct(uniqueProducts[0])
        }

        setLoading(false)
      } catch (err) {
        setError("Erreur lors de la récupération des données")
        setLoading(false)
        console.error(err)
      }
    }

    fetchPredictions()
  }, [])

  // Préparer les données pour le graphique à barres
  const prepareBarChartData = () => {
    // Grouper par date (jour)
    const groupedByDate = predictions.reduce((acc, prediction) => {
      const date = new Date(prediction.timestamp).toLocaleDateString()

      if (!acc[date]) {
        acc[date] = { date, positive: 0, neutral: 0, negative: 0 }
      }

      acc[date][prediction.sentiment] += 1

      return acc
    }, {})

    // Convertir en tableau pour Recharts
    return Object.values(groupedByDate)
  }

  // Préparer les données pour le graphique circulaire
  const preparePieChartData = () => {
    if (!selectedProduct) return []

    // Filtrer les prédictions pour le produit sélectionné
    const productPredictions = predictions.filter((p) => p.asin === selectedProduct)

    // Compter les sentiments
    const sentimentCounts = productPredictions.reduce((acc, prediction) => {
      if (!acc[prediction.sentiment]) {
        acc[prediction.sentiment] = 0
      }

      acc[prediction.sentiment] += 1

      return acc
    }, {})

    // Convertir en tableau pour Recharts
    return Object.entries(sentimentCounts).map(([name, value]) => ({ name, value }))
  }

  // Préparer les données pour le graphique de tendance
  const prepareTrendData = () => {
    // Grouper par date (jour)
    const dates = {}
    predictions.forEach((prediction) => {
      const date = new Date(prediction.timestamp).toLocaleDateString()
      if (!dates[date]) {
        dates[date] = { date, positive: 0, neutral: 0, negative: 0, total: 0 }
      }
      dates[date][prediction.sentiment]++
      dates[date].total++
    })

    // Convertir en tableau et trier par date
    return Object.values(dates)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map((item) => ({
        ...item,
        positiveRate: item.total ? (item.positive / item.total) * 100 : 0,
        neutralRate: item.total ? (item.neutral / item.total) * 100 : 0,
        negativeRate: item.total ? (item.negative / item.total) * 100 : 0,
      }))
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Erreur!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    )
  }

  const barChartData = prepareBarChartData()
  const pieChartData = preparePieChartData()
  const trendData = prepareTrendData()

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-md rounded-md">
          <p className="font-medium">{`${label}`}</p>
          {payload.map((entry, index) => (
            <p key={`item-${index}`} style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value}`}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6 mt-6">
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-bold text-purple-700 mb-6">Tableau de Bord d'Analyse</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white border-l-4 border-purple-600 rounded-lg shadow p-4">
            <div className="text-sm font-medium text-gray-500 mb-1">Avis Positifs</div>
            <div className="text-2xl font-bold text-purple-700">
              {predictions.filter((p) => p.sentiment === "positive").length}
            </div>
            <div className="text-xs text-gray-500">
              {predictions.length
                ? Math.round((predictions.filter((p) => p.sentiment === "positive").length / predictions.length) * 100)
                : 0}
              % du total
            </div>
          </div>
          <div className="bg-white border-l-4 border-orange-500 rounded-lg shadow p-4">
            <div className="text-sm font-medium text-gray-500 mb-1">Avis Neutres</div>
            <div className="text-2xl font-bold text-orange-600">
              {predictions.filter((p) => p.sentiment === "neutral").length}
            </div>
            <div className="text-xs text-gray-500">
              {predictions.length
                ? Math.round((predictions.filter((p) => p.sentiment === "neutral").length / predictions.length) * 100)
                : 0}
              % du total
            </div>
          </div>
          <div className="bg-white border-l-4 border-red-500 rounded-lg shadow p-4">
            <div className="text-sm font-medium text-gray-500 mb-1">Avis Négatifs</div>
            <div className="text-2xl font-bold text-red-600">
              {predictions.filter((p) => p.sentiment === "negative").length}
            </div>
            <div className="text-xs text-gray-500">
              {predictions.length
                ? Math.round((predictions.filter((p) => p.sentiment === "negative").length / predictions.length) * 100)
                : 0}
              % du total
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Tendance des sentiments */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Tendance des Sentiments</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis dataKey="date" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="positiveRate"
                    name="Positif %"
                    stroke={COLORS.positive}
                    activeDot={{ r: 8 }}
                  />
                  <Line type="monotone" dataKey="neutralRate" name="Neutre %" stroke={COLORS.neutral} />
                  <Line type="monotone" dataKey="negativeRate" name="Négatif %" stroke={COLORS.negative} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Répartition par produit */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Répartition par Produit</h3>
            <div className="mb-4">
              <label htmlFor="product-select" className="block text-sm font-medium text-gray-700 mb-1">
                Sélectionner un produit (ASIN)
              </label>
              <select
                id="product-select"
                value={selectedProduct || ""}
                onChange={(e) => setSelectedProduct(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {products.map((product) => (
                  <option key={product} value={product}>
                    {product}
                  </option>
                ))}
              </select>
            </div>
            <div className="h-64">
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
                      <Cell key={`cell-${index}`} fill={COLORS[entry.name] || "#000000"} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Résultat des prédictions par date */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Résultat des prédictions par date</h3>
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveTab("bar")}
                className={`px-3 py-1 text-sm rounded-md ${
                  activeTab === "bar" ? "bg-purple-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Barres
              </button>
              <button
                onClick={() => setActiveTab("stacked")}
                className={`px-3 py-1 text-sm rounded-md ${
                  activeTab === "stacked" ? "bg-purple-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Empilé
              </button>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="date" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar
                  dataKey="negative"
                  stackId={activeTab === "stacked" ? "a" : undefined}
                  fill={COLORS.negative}
                  name="Négatif"
                />
                <Bar
                  dataKey="neutral"
                  stackId={activeTab === "stacked" ? "a" : undefined}
                  fill={COLORS.neutral}
                  name="Neutre"
                />
                <Bar
                  dataKey="positive"
                  stackId={activeTab === "stacked" ? "a" : undefined}
                  fill={COLORS.positive}
                  name="Positif"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Produits les plus commentés */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 mt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Produits les plus commentés</h3>
          <div className="space-y-4">
            {products.slice(0, 5).map((product, index) => {
              const count = predictions.filter((p) => p.asin === product).length
              const positive = predictions.filter((p) => p.asin === product && p.sentiment === "positive").length
              const percent = Math.round((positive / count) * 100) || 0
              return (
                <div key={product} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-purple-600 font-semibold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{product}</p>
                      <p className="text-xs text-gray-500">{count} avis</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-purple-600">{percent}%</p>
                    <p className="text-xs text-gray-500">positifs</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
