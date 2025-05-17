import ProductAnalytics from "@/components/analytics/product-analytics"
import SentimentTrends from "@/components/analytics/sentiment-trends"

export default function AnalyticsPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Analyses</h1>

      <SentimentTrends />

      <ProductAnalytics />
    </div>
  )
}
