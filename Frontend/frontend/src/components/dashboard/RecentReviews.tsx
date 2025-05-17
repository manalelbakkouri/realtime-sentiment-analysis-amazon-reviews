"use client"

import { useEffect, useState } from "react"
import { ThumbsUp, ThumbsDown, Minus, Star, ExternalLink } from "lucide-react"
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

const RecentReviews = () => {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [newReviewAlert, setNewReviewAlert] = useState(false)

  useEffect(() => {
    // Charger les avis récents
    const fetchReviews = async () => {
      setLoading(true)
      try {
        const response = await axios.get("http://localhost:5000/api/predictions?limit=10")
        setReviews(response.data)
      } catch (error) {
        console.error("Error fetching reviews:", error)
      } finally {
        setLoading(false)
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
      setNewReviewAlert(true)

      // Masquer l'alerte après 3 secondes
      setTimeout(() => {
        setNewReviewAlert(false)
      }, 3000)
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
        return <ThumbsUp className="h-4 w-4 text-success" />
      case "negative":
        return <ThumbsDown className="h-4 w-4 text-danger" />
      default:
        return <Minus className="h-4 w-4 text-secondary" />
    }
  }

  const getSentimentBadge = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return <span className="badge badge-success">Positif</span>
      case "negative":
        return <span className="badge badge-danger">Négatif</span>
      default:
        return <span className="badge badge-secondary">Neutre</span>
    }
  }

  const renderStars = (rating: number) => {
    return (
      <div className="rating">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className={i < Math.floor(rating) ? "fill-current" : "stroke-current"} size={16} />
        ))}
        <span className="rating-text">{rating}/5</span>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Avis récents</h3>
        <div className="flex items-center gap-2">
          {newReviewAlert && <span className="badge badge-success animate-pulse">Nouvel avis reçu!</span>}
          <button className="btn btn-outline btn-sm">Voir tous</button>
        </div>
      </div>
      <div className="card-content">
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="loading h-24 rounded-md"></div>
            ))}
          </div>
        ) : reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review._id} className="review-item">
                <div className="review-header">
                  <h4 className="review-title">{review.summary}</h4>
                  <div className="flex items-center gap-2">
                    {getSentimentIcon(review.sentiment)}
                    {getSentimentBadge(review.sentiment)}
                  </div>
                </div>
                <div className="review-meta">
                  <div className="flex items-center justify-between">
                    <span>Produit: {review.asin}</span>
                    {renderStars(review.overall)}
                  </div>
                </div>
                <p className="review-text line-clamp-2">{review.reviewText}</p>
                <div className="review-footer">
                  <span>
                    {review.timestamp
                      ? format(new Date(review.timestamp), "dd MMMM yyyy à HH:mm", { locale: fr })
                      : review.reviewTime}
                  </span>
                  <a
                    href={`https://amazon.com/dp/${review.asin}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-primary hover:underline"
                  >
                    <span>Voir sur Amazon</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-40 items-center justify-center">
            <p className="text-gray-500 dark:text-gray-400">Aucun avis disponible pour le moment</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default RecentReviews
