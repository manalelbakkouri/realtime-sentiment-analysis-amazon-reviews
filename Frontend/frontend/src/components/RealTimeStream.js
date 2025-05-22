"use client"

import { useState, useEffect } from "react"
import axios from "axios"

function RealTimeStream() {
  const [predictions, setPredictions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState("all")
  const [stats, setStats] = useState({ positive: 0, neutral: 0, negative: 0, total: 0 })

  // URL de l'API (même conteneur => localhost)
  const API_BASE_URL = "http://localhost:5000"

  const fetchLatestPredictions = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_BASE_URL}/api/predictions?t=${new Date().getTime()}`)

      if (Array.isArray(response.data)) {
        const latestPredictions = response.data.slice(-10).reverse()
        setPredictions(latestPredictions)

        // Calculate stats
        const positive = response.data.filter((p) => p.sentiment === "positive").length
        const neutral = response.data.filter((p) => p.sentiment === "neutral").length
        const negative = response.data.filter((p) => p.sentiment === "negative").length
        setStats({
          positive,
          neutral,
          negative,
          total: response.data.length,
        })
      } else {
        console.warn("La réponse n'est pas un tableau:", response.data)
        setPredictions([])
      }

      setLoading(false)
      setError(null)
    } catch (err) {
      console.error("Erreur lors de la récupération des données:", err)
      setError(`Erreur lors de la récupération des données: ${err.message}`)
      setLoading(false)

      try {
        const testResponse = await axios.get(`${API_BASE_URL}/api/predictions/test`)
        console.log("Test API response:", testResponse.data)
      } catch (testErr) {
        console.error("L'API n'est pas accessible:", testErr)
      }
    }
  }

  useEffect(() => {
    fetchLatestPredictions()
    const interval = setInterval(() => {
      fetchLatestPredictions()
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const getSentimentClass = (sentiment) => {
    switch (sentiment) {
      case "negative":
        return "bg-red-500 text-white hover:bg-red-600"
      case "neutral":
        return "bg-orange-500 text-white hover:bg-orange-600"
      case "positive":
        return "bg-purple-600 text-white hover:bg-purple-700"
      default:
        return "bg-gray-500 text-white hover:bg-gray-600"
    }
  }

  const filteredPredictions = activeTab === "all" ? predictions : predictions.filter((p) => p.sentiment === activeTab)

  return (
    <div className="space-y-6 bg-white p-6 rounded-lg shadow-lg">
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-purple-700">Flux de Prédictions en Temps Réel</h1>
          <p className="text-gray-500">Visualisez les dernières analyses de sentiment en temps réel</p>
        </div>
        <div className="flex space-x-2">
          <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
            </svg>
            Filtrer
          </button>
          <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Exporter
          </button>
          <button
            onClick={fetchLatestPredictions}
            className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="1 4 1 10 7 10"></polyline>
              <polyline points="23 20 23 14 17 14"></polyline>
              <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path>
            </svg>
            Rafraîchir
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white border rounded-lg shadow p-4">
          <div className="text-sm font-medium text-gray-500 mb-1">Total des Prédictions</div>
          <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
          <p className="text-xs text-gray-500">Dernière mise à jour: {new Date().toLocaleTimeString()}</p>
        </div>
        <div className="bg-white border-l-4 border-l-purple-500 rounded-lg shadow p-4">
          <div className="text-sm font-medium text-gray-500 mb-1">Avis Positifs</div>
          <div className="flex items-baseline space-x-2">
            <div className="text-2xl font-bold text-purple-700">{stats.positive}</div>
            <div className="text-sm text-gray-500">
              ({stats.total ? Math.round((stats.positive / stats.total) * 100) : 0}%)
            </div>
          </div>
          <div className="mt-1 h-2 w-full rounded-full bg-gray-100">
            <div
              className="h-2 rounded-full bg-purple-500"
              style={{ width: `${stats.total ? (stats.positive / stats.total) * 100 : 0}%` }}
            ></div>
          </div>
        </div>
        <div className="bg-white border-l-4 border-l-orange-500 rounded-lg shadow p-4">
          <div className="text-sm font-medium text-gray-500 mb-1">Avis Neutres</div>
          <div className="flex items-baseline space-x-2">
            <div className="text-2xl font-bold text-orange-600">{stats.neutral}</div>
            <div className="text-sm text-gray-500">
              ({stats.total ? Math.round((stats.neutral / stats.total) * 100) : 0}%)
            </div>
          </div>
          <div className="mt-1 h-2 w-full rounded-full bg-gray-100">
            <div
              className="h-2 rounded-full bg-orange-500"
              style={{ width: `${stats.total ? (stats.neutral / stats.total) * 100 : 0}%` }}
            ></div>
          </div>
        </div>
        <div className="bg-white border-l-4 border-l-red-500 rounded-lg shadow p-4">
          <div className="text-sm font-medium text-gray-500 mb-1">Avis Négatifs</div>
          <div className="flex items-baseline space-x-2">
            <div className="text-2xl font-bold text-red-600">{stats.negative}</div>
            <div className="text-sm text-gray-500">
              ({stats.total ? Math.round((stats.negative / stats.total) * 100) : 0}%)
            </div>
          </div>
          <div className="mt-1 h-2 w-full rounded-full bg-gray-100">
            <div
              className="h-2 rounded-full bg-red-500"
              style={{ width: `${stats.total ? (stats.negative / stats.total) * 100 : 0}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="bg-white border rounded-lg shadow">
        <div className="border-b px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-800">Dernières Prédictions</h2>
          <p className="text-sm text-gray-500">Les 10 dernières prédictions de sentiment analysées</p>
          <div className="mt-4 flex space-x-1 border-b">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === "all"
                  ? "border-b-2 border-purple-600 text-purple-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Tous
            </button>
            <button
              onClick={() => setActiveTab("positive")}
              className={`px-4 py-2 text-sm font-medium flex items-center gap-1 ${
                activeTab === "positive"
                  ? "border-b-2 border-purple-600 text-purple-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-purple-500"></span>
              Positifs
            </button>
            <button
              onClick={() => setActiveTab("neutral")}
              className={`px-4 py-2 text-sm font-medium flex items-center gap-1 ${
                activeTab === "neutral"
                  ? "border-b-2 border-orange-500 text-orange-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-orange-500"></span>
              Neutres
            </button>
            <button
              onClick={() => setActiveTab("negative")}
              className={`px-4 py-2 text-sm font-medium flex items-center gap-1 ${
                activeTab === "negative"
                  ? "border-b-2 border-red-500 text-red-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-red-500"></span>
              Négatifs
            </button>
          </div>
        </div>
        <div className="p-6">
          {loading && predictions.length === 0 ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-purple-500"></div>
            </div>
          ) : error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700" role="alert">
              <strong className="font-bold">Erreur!</strong>
              <span className="block sm:inline"> {error}</span>
              <p className="mt-2">
                <button
                  onClick={fetchLatestPredictions}
                  className="mt-2 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm"
                >
                  Réessayer
                </button>
              </p>
            </div>
          ) : (
            <>
              {filteredPredictions.length === 0 ? (
                <div className="py-4 text-center">
                  <p className="text-gray-500">Aucune prédiction disponible pour le moment.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredPredictions.map((prediction, index) => (
                    <div
                      key={index}
                      className="relative rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-md"
                    >
                      <div className="absolute right-4 top-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getSentimentClass(prediction.sentiment)}`}
                        >
                          {prediction.sentiment || "unknown"}
                        </span>
                      </div>
                      <div className="mb-2 flex items-center gap-2">
                        <svg
                          className="h-4 w-4 text-gray-400"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                          <line x1="7" y1="7" x2="7.01" y2="7"></line>
                        </svg>
                        <span className="font-medium text-gray-700">
                          Produit: <span className="text-purple-600">{prediction.asin || "N/A"}</span>
                        </span>
                      </div>
                      <div className="mb-4">
                        <div className="flex items-start gap-2">
                          <svg
                            className="h-4 w-4 mt-1 text-gray-400"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                          </svg>
                          <p className="text-gray-700">
                            {prediction.text
                              ? prediction.text.length > 100
                                ? `${prediction.text.substring(0, 100)}...`
                                : prediction.text
                              : "N/A"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between border-t border-gray-100 pt-2 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <svg
                            className="h-3 w-3"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                          </svg>
                          {prediction.timestamp ? new Date(prediction.timestamp).toLocaleString() : "N/A"}
                        </div>
                        <div>ID: {prediction.reviewID || "N/A"}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default RealTimeStream
