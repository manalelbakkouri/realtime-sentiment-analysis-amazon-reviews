"use client"

import { useEffect, useState } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import axios from "axios"

interface SentimentCount {
  _id: string
  count: number
}

const COLORS = ["#10b981", "#ef4444", "#6b7280"]

const SentimentChart = () => {
  const [data, setData] = useState<{ name: string; value: number }[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/analytics/sentiment")
        const sentimentData = response.data as SentimentCount[]

        const formattedData = sentimentData.map((item) => ({
          name: item._id.charAt(0).toUpperCase() + item._id.slice(1),
          value: item.count,
        }))

        setData(formattedData)
      } catch (error) {
        console.error("Error fetching sentiment data:", error)
      }
    }

    fetchData()

    // Rafraîchir les données toutes les 30 secondes
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Répartition des sentiments</h3>
      </div>
      <div className="h-80">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center">
            <p className="text-gray-500">Chargement des données...</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default SentimentChart
