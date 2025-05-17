"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ThumbsUp, ThumbsDown, Minus, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import axios from "axios"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

interface Review {
  _id: string
  reviewerID: string
  asin: string
  reviewText: string
  overall: number
  summary: string
  unixReviewTime: number
  reviewTime: string
  prediction?: number
  sentiment?: string
  timestamp?: string
}

export default function ReviewsList() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [productId, setProductId] = useState("")

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true)
      try {
        let url = "http://localhost:5000/api/predictions?limit=100"
        if (productId) {
          url = `http://localhost:5000/api/product/${productId}`
        }

        const response = await axios.get(url)
        setReviews(response.data)
      } catch (error) {
        console.error("Error fetching reviews:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchReviews()
  }, [productId])

  const getSentimentIcon = (sentiment?: string) => {
    switch (sentiment) {
      case "positive":
        return <ThumbsUp className="h-4 w-4 text-green-500" />
      case "negative":
        return <ThumbsDown className="h-4 w-4 text-red-500" />
      default:
        return <Minus className="h-4 w-4 text-gray-500" />
    }
  }

  const getSentimentBadge = (sentiment?: string) => {
    switch (sentiment) {
      case "positive":
        return <Badge className="bg-green-500">Positif</Badge>
      case "negative":
        return <Badge className="bg-red-500">Négatif</Badge>
      default:
        return <Badge className="bg-gray-500">Neutre</Badge>
    }
  }

  const filteredReviews = reviews.filter(
    (review) =>
      review.reviewText?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.summary?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.asin?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row">
        <form onSubmit={handleSearch} className="flex-1">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Rechercher dans les avis..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </form>

        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="ID du produit (ASIN)"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
          />
          <Button variant="outline" onClick={() => setProductId("")} disabled={!productId}>
            Réinitialiser
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <p className="text-muted-foreground">Chargement des avis...</p>
        </div>
      ) : filteredReviews.length > 0 ? (
        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <Card key={review._id}>
              <CardContent className="p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{review.summary}</h3>
                      {getSentimentBadge(review.sentiment)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Produit: {review.asin} | Note: {review.overall}/5
                    </p>
                    <div className="mt-4">
                      <p className="text-sm">{review.reviewText}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-1">
                      {getSentimentIcon(review.sentiment)}
                      <span className="text-sm font-medium capitalize">{review.sentiment || "Non analysé"}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {review.timestamp
                        ? format(new Date(review.timestamp), "dd MMMM yyyy à HH:mm", { locale: fr })
                        : review.reviewTime}
                    </p>
                    <p className="text-xs text-muted-foreground">ID: {review.reviewerID}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex h-40 items-center justify-center">
          <p className="text-muted-foreground">Aucun avis trouvé</p>
        </div>
      )}
    </div>
  )
}
