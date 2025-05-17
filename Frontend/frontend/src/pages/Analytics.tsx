import ProductAnalytics from "../components/analytics/ProductAnalytics"
import SentimentTrends from "../components/analytics/SentimentTrends"

const Analytics = () => {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Analyses</h1>

      <SentimentTrends />

      <ProductAnalytics />
    </div>
  )
}

export default Analytics
