
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import SentimentPieChart from "../charts/SentimentPieChart";

type SentimentChartCardProps = {
  stats: any;
  loading: boolean;
};

const SentimentChartCard = ({ stats, loading }: SentimentChartCardProps) => {
  return (
    <Card className="dashboard-card">
      <CardHeader>
        <CardTitle>Sentiment Distribution</CardTitle>
        <CardDescription>Overall sentiment breakdown</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[300px] flex items-center justify-center">
            <Skeleton className="h-[250px] w-[250px] rounded-full" />
          </div>
        ) : stats ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <SentimentPieChart data={stats.sentiment_counts} />
          </motion.div>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            No data available
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SentimentChartCard;
