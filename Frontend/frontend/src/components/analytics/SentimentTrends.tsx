"use client"

import { useEffect, useState } from "react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import axios from "axios"
import { format, parseISO } from "date-fns"
import { fr } from "date-fns/locale"

interface TimelineData {
  _id: {
    date: string
    sentiment: string
  }
  count: number
}

const SentimentTrends = () => {
  const [data, setData] = useState<any[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/analytics/timeline")
        const timelineData = response.data as TimelineData[]

        // Transformer les données pour le graphique
        const dateMap = new Map()

        timelineData.forEach((item) => {
          const date = item._id.date
          const sentiment = item._id.sentiment
          const count = item.count

          if (!dateMap.has(date)) {
            dateMap.set(date, {
              date,
              positive: 0,
              negative: 0,
              neutral: 0,
            })
          }

          const dateEntry = dateMap.get(date)
          dateEntry[sentiment] = count
        })

        const formattedData = Array.from(dateMap.values()).sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
        )

        setData(formattedData)
      } catch (error) {
        console.error("Error fetching timeline data:", error)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Tendances des sentiments</h3>
      </div>
      <div className="h-96">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{
                top: 10,
                right: 30,
                left: 0,
                bottom: 0,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={(date) => format(parseISO(date), "dd MMM", { locale: fr })} />
              <YAxis />
              <Tooltip labelFormatter={(date) => format(parseISO(date), "dd MMMM yyyy", { locale: fr })} />
              <Legend />
              <Area type="monotone" dataKey="positive" stackId="1" stroke="#10b981" fill="#10b981" name="Positif" />
              <Area type="monotone" dataKey="neutral" stackId="1" stroke="#6b7280" fill="#6b7280" name="Neutre" />
              <Area type="monotone" dataKey="negative" stackId="1" stroke="#ef4444" fill="#ef4444" name="Négatif" />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center">
            <p className="text-gray-500 dark:text-gray-400">Chargement des données...</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default SentimentTrends
