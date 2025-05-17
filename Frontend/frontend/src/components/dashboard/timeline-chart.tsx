"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
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

export default function TimelineChart() {
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

    // Rafraîchir les données toutes les 30 secondes
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Évolution des sentiments</CardTitle>
      </CardHeader>
      <CardContent className="h-80">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={(date) => format(parseISO(date), "dd MMM", { locale: fr })} />
              <YAxis />
              <Tooltip labelFormatter={(date) => format(parseISO(date), "dd MMMM yyyy", { locale: fr })} />
              <Legend />
              <Line type="monotone" dataKey="positive" stroke="#4ade80" name="Positif" activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey="negative" stroke="#f87171" name="Négatif" />
              <Line type="monotone" dataKey="neutral" stroke="#94a3b8" name="Neutre" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center">
            <p className="text-muted-foreground">Chargement des données...</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
