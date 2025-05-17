"use client"

import { useEffect, useState } from "react"
import { MessageSquare, ThumbsUp, ThumbsDown, BarChart3 } from "lucide-react"
import axios from "axios"

interface SentimentCount {
  _id: string
  count: number
}

const DashboardStats = () => {
  const [stats, setStats] = useState({
    total: 0,
    positive: 0,
    negative: 0,
    neutral: 0,
  })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/analytics/sentiment")
        const data = response.data as SentimentCount[]

        const positive = data.find((item) => item._id === "positive")?.count || 0
        const negative = data.find((item) => item._id === "negative")?.count || 0
        const neutral = data.find((item) => item._id === "neutral")?.count || 0
        const total = positive + negative + neutral

        setStats({
          total,
          positive,
          negative,
          neutral,
        })
      } catch (error) {
        console.error("Error fetching stats:", error)
      }
    }

    fetchStats()

    // Rafraîchir les statistiques toutes les 30 secondes
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <div className="card">
        <div className="card-header">
          <h3 className="card-title text-sm font-medium">Total des avis</h3>
          <MessageSquare className="h-4 w-4 text-gray-500" />
        </div>
        <div className="card-content">
          <div className="text-2xl font-bold">{stats.total}</div>
          <p className="text-xs text-gray-500">Avis analysés</p>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title text-sm font-medium">Avis positifs</h3>
          <ThumbsUp className="h-4 w-4 text-gray-500" />
        </div>
        <div className="card-content">
          <div className="text-2xl font-bold">{stats.positive}</div>
          <p className="text-xs text-gray-500">
            {stats.total > 0 ? `${Math.round((stats.positive / stats.total) * 100)}% du total` : "0% du total"}
          </p>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title text-sm font-medium">Avis négatifs</h3>
          <ThumbsDown className="h-4 w-4 text-gray-500" />
        </div>
        <div className="card-content">
          <div className="text-2xl font-bold">{stats.negative}</div>
          <p className="text-xs text-gray-500">
            {stats.total > 0 ? `${Math.round((stats.negative / stats.total) * 100)}% du total` : "0% du total"}
          </p>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title text-sm font-medium">Avis neutres</h3>
          <BarChart3 className="h-4 w-4 text-gray-500" />
        </div>
        <div className="card-content">
          <div className="text-2xl font-bold">{stats.neutral}</div>
          <p className="text-xs text-gray-500">
            {stats.total > 0 ? `${Math.round((stats.neutral / stats.total) * 100)}% du total` : "0% du total"}
          </p>
        </div>
      </div>
    </div>
  )
}

export default DashboardStats
