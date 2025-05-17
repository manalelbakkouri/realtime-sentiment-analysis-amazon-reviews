"use client"

import { useEffect, useState } from "react"
import { MessageSquare, ThumbsUp, ThumbsDown, BarChart3, TrendingUp, TrendingDown } from "lucide-react"
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
  const [loading, setLoading] = useState(true)
  const [trends, setTrends] = useState({
    total: 5,
    positive: 12,
    negative: -8,
    neutral: 3,
  })

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true)
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
      } finally {
        setLoading(false)
      }
    }

    fetchStats()

    // Rafraîchir les statistiques toutes les 30 secondes
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <div className={`card stat-card ${loading ? "loading" : ""}`}>
        <MessageSquare className="stat-icon" size={48} />
        <div className="card-header">
          <h3 className="card-title text-sm font-medium">Total des avis</h3>
        </div>
        <div className="card-content">
          <div className="stat-value">{stats.total.toLocaleString()}</div>
          <p className="stat-label">Avis analysés</p>
          <div className={`stat-trend ${trends.total >= 0 ? "up" : "down"}`}>
            {trends.total >= 0 ? <TrendingUp className="mr-1 h-3 w-3" /> : <TrendingDown className="mr-1 h-3 w-3" />}
            <span>{Math.abs(trends.total)}% depuis hier</span>
          </div>
        </div>
      </div>

      <div className={`card stat-card ${loading ? "loading" : ""}`}>
        <ThumbsUp className="stat-icon" size={48} />
        <div className="card-header">
          <h3 className="card-title text-sm font-medium">Avis positifs</h3>
        </div>
        <div className="card-content">
          <div className="stat-value">{stats.positive.toLocaleString()}</div>
          <p className="stat-label">
            {stats.total > 0 ? `${Math.round((stats.positive / stats.total) * 100)}% du total` : "0% du total"}
          </p>
          <div className="progress-container">
            <div
              className="progress-bar progress-bar-success"
              style={{ width: `${stats.total > 0 ? (stats.positive / stats.total) * 100 : 0}%` }}
            ></div>
          </div>
          <div className={`stat-trend ${trends.positive >= 0 ? "up" : "down"}`}>
            {trends.positive >= 0 ? <TrendingUp className="mr-1 h-3 w-3" /> : <TrendingDown className="mr-1 h-3 w-3" />}
            <span>{Math.abs(trends.positive)}% depuis hier</span>
          </div>
        </div>
      </div>

      <div className={`card stat-card ${loading ? "loading" : ""}`}>
        <ThumbsDown className="stat-icon" size={48} />
        <div className="card-header">
          <h3 className="card-title text-sm font-medium">Avis négatifs</h3>
        </div>
        <div className="card-content">
          <div className="stat-value">{stats.negative.toLocaleString()}</div>
          <p className="stat-label">
            {stats.total > 0 ? `${Math.round((stats.negative / stats.total) * 100)}% du total` : "0% du total"}
          </p>
          <div className="progress-container">
            <div
              className="progress-bar progress-bar-danger"
              style={{ width: `${stats.total > 0 ? (stats.negative / stats.total) * 100 : 0}%` }}
            ></div>
          </div>
          <div className={`stat-trend ${trends.negative >= 0 ? "up" : "down"}`}>
            {trends.negative >= 0 ? <TrendingUp className="mr-1 h-3 w-3" /> : <TrendingDown className="mr-1 h-3 w-3" />}
            <span>{Math.abs(trends.negative)}% depuis hier</span>
          </div>
        </div>
      </div>

      <div className={`card stat-card ${loading ? "loading" : ""}`}>
        <BarChart3 className="stat-icon" size={48} />
        <div className="card-header">
          <h3 className="card-title text-sm font-medium">Avis neutres</h3>
        </div>
        <div className="card-content">
          <div className="stat-value">{stats.neutral.toLocaleString()}</div>
          <p className="stat-label">
            {stats.total > 0 ? `${Math.round((stats.neutral / stats.total) * 100)}% du total` : "0% du total"}
          </p>
          <div className="progress-container">
            <div
              className="progress-bar progress-bar-info"
              style={{ width: `${stats.total > 0 ? (stats.neutral / stats.total) * 100 : 0}%` }}
            ></div>
          </div>
          <div className={`stat-trend ${trends.neutral >= 0 ? "up" : "down"}`}>
            {trends.neutral >= 0 ? <TrendingUp className="mr-1 h-3 w-3" /> : <TrendingDown className="mr-1 h-3 w-3" />}
            <span>{Math.abs(trends.neutral)}% depuis hier</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardStats
