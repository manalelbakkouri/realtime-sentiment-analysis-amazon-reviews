"use client"

import { useEffect, useState, useRef } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import axios from "axios"
import { ArrowUpRight, Download } from "lucide-react"

interface SentimentCount {
  _id: string
  count: number
}

const COLORS = ["#10b981", "#ef4444", "#6b7280"]
const RADIAN = Math.PI / 180

const SentimentChart = () => {
  const [data, setData] = useState<{ name: string; value: number }[]>([])
  const [loading, setLoading] = useState(true)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const chartRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
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
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    // Rafraîchir les données toutes les 30 secondes
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    const isHovered = index === hoveredIndex

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        className={`font-medium transition-all duration-300 ${isHovered ? "font-bold text-lg" : ""}`}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  const downloadChart = () => {
    if (chartRef.current) {
      // Cette fonction est simplifiée - dans un cas réel, vous utiliseriez
      // une bibliothèque comme html2canvas pour capturer le graphique
      alert("Téléchargement du graphique (fonctionnalité simulée)")
    }
  }

  return (
    <div className={`card chart-container ${loading ? "loading" : ""}`} ref={chartRef}>
      <div className="card-header">
        <h3 className="card-title">Répartition des sentiments</h3>
        <div className="flex items-center gap-2">
          <button className="btn btn-outline btn-sm flex items-center gap-1" onClick={downloadChart}>
            <Download size={14} />
            <span>Exporter</span>
          </button>
          <button className="btn btn-primary btn-sm flex items-center gap-1">
            <span>Détails</span>
            <ArrowUpRight size={14} />
          </button>
        </div>
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
                label={renderCustomizedLabel}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                onMouseEnter={(_, index) => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                animationDuration={1000}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                    className="transition-all duration-300"
                    style={{
                      filter: hoveredIndex === index ? "brightness(1.1)" : "brightness(1)",
                      transform: hoveredIndex === index ? "scale(1.05)" : "scale(1)",
                      transformOrigin: "center",
                    }}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => [`${value} avis`, "Nombre"]}
                contentStyle={{
                  borderRadius: "0.5rem",
                  border: "1px solid var(--card-border)",
                  backgroundColor: "var(--card-bg)",
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                formatter={(value, entry, index) => (
                  <span style={{ color: hoveredIndex === index ? COLORS[index % COLORS.length] : "inherit" }}>
                    {value}
                  </span>
                )}
              />
            </PieChart>
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

export default SentimentChart
