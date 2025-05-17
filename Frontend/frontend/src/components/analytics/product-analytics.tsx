"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import axios from "axios"

interface ProductData {
  _id: {
    asin: string
    sentiment: string
  }
  count: number
  avg_score: number
}

export default function ProductAnalytics() {
  const [data, setData] = useState<any[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/analytics/products")
        const productData = response.data as ProductData[]

        // Transformer les données pour le graphique
        const productMap = new Map()

        productData.forEach((item) => {
          const asin = item._id.asin
          const sentiment = item._id.sentiment
          const count = item.count
          const avgScore = item.avg_score

          if (!productMap.has(asin)) {
            productMap.set(asin, {
              asin,
              positive: 0,
              negative: 0,
              neutral: 0,
              avgScore: 0,
              totalCount: 0,
            })
          }

          const productEntry = productMap.get(asin)
          productEntry[sentiment] = count
          productEntry.totalCount += count
          productEntry.avgScore =
            (productEntry.avgScore * (productEntry.totalCount - count) + avgScore * count) / productEntry.totalCount
        })

        // Prendre les 10 produits avec le plus d'avis
        const formattedData = Array.from(productMap.values())
          .sort((a, b) => b.totalCount - a.totalCount)
          .slice(0, 10)

        setData(formattedData)
      } catch (error) {
        console.error("Error fetching product data:", error)
      }
    }

    fetchData()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Analyse par produit (Top 10)</CardTitle>
      </CardHeader>
      <CardContent className="h-96">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="asin" />
              <YAxis />
              <Tooltip
                formatter={(value, name) => [value, name === "avgScore" ? "Note moyenne" : `Avis ${name}`]}
                labelFormatter={(asin) => `Produit: ${asin}`}
              />
              <Legend />
              <Bar dataKey="positive" name="Positif" stackId="a" fill="#4ade80" />
              <Bar dataKey="neutral" name="Neutre" stackId="a" fill="#94a3b8" />
              <Bar dataKey="negative" name="Négatif" stackId="a" fill="#f87171" />
            </BarChart>
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
