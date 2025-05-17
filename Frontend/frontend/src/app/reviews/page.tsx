import ReviewsList from "@/components/reviews/reviews-list"

export default function ReviewsPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Tous les avis</h1>
      <ReviewsList />
    </div>
  )
}
