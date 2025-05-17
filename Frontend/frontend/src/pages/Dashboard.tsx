import DashboardStats from "../components/dashboard/DashboardStats"
import RecentReviews from "../components/dashboard/RecentReviews"
import SentimentChart from "../components/dashboard/SentimentChart"
import TimelineChart from "../components/dashboard/TimelineChart"

const Dashboard = () => {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <DashboardStats />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <SentimentChart />
        <TimelineChart />
      </div>

      <RecentReviews />
    </div>
  )
}

export default Dashboard
