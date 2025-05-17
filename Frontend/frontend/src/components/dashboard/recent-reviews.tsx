"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ThumbsUp, ThumbsDown, Minus } from "lucide-react"
import axios from "axios"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { io } from "socket.io-client"

interface Review {
  _id: string
  reviewerID: string
  asin: string
  reviewText: string
  overall: number
  summary: string
  unixReviewTime: number
  reviewTime: string
  prediction: number
  sentiment: string
  timestamp: string
}

export default function RecentReviews() {
  const [reviews, setReviews] = useState<Review[]>([])

  useEffect(() => {
    // Charger les avis récents
    const fetchReviews = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/predictions?limit=10")
        setReviews(response.data)
      } catch (error) {
        console.error("Error fetching reviews:", error)
      }
    }

    fetchReviews()

    // Configurer Socket.IO pour les mises à jour en temps réel
    const socket = io("http://localhost:5000")

    socket.on("connect", () => {
      console.log("Connected to WebSocket server")
    })

    socket.on("new_prediction", (newReview: Review) => {
      setReviews((prevReviews) => [newReview, ...prevReviews].slice(0, 10))
    })

    socket.on("disconnect", () => {
      console.log("Disconnected from WebSocket server")
    })

    return () => {
      socket.disconnect()
    }
  }, [])

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return <ThumbsUp className="h-4 w-4 text-green-500" />
      case "negative":
        return <ThumbsDown className="h-4 w-4 text-red-500" />
      default:
        return <Minus className="h-4 w-4 text-gray-500" />
    }
  }

  const getSentimentBadge = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return <Badge className="bg-green-500">Positif</Badge>
      case "negative":
        return <Badge className="bg-red-500">Négatif</Badge>
      default:
        return <Badge className="bg-gray-500">Neutre</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Avis récents</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {reviews.length > 0 ? (
            reviews.map((review) => (
              <div key={review._id} className="border-b pb-4 last:border-0">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium">{review.summary}</h3>
                    <p className="text-sm text-muted-foreground">
                      Produit: {review.asin} | Note: {review.overall}/5
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getSentimentIcon(review.sentiment)}
                    {getSentimentBadge(review.sentiment)}
                  </div>
                </div>
                <p className="mt-2 text-sm line-clamp-2">{review.reviewText}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {review.timestamp
                    ? format(new Date(review.timestamp), "dd MMMM yyyy à HH:mm", { locale: fr })
                    : review.reviewTime}
                </p>
              </div>
            ))
          ) : (
            <div className="flex h-40 items-center justify-center">
              <p className="text-muted-foreground">Aucun avis disponible pour le moment</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
