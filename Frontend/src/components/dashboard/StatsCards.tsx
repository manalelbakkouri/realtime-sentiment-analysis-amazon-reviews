
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import SentimentBadge from "../SentimentBadge";

type StatsCardsProps = {
  stats: any;
  loading: boolean;
};

const StatsCards = ({ stats, loading }: StatsCardsProps) => {
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      variants={containerVariants}
    >
      {/* Total Reviews Card */}
      <motion.div variants={itemVariants}>
        <Card className="dashboard-card hover-card">
          <CardHeader className="pb-2">
            <CardDescription>Total Reviews</CardDescription>
            <CardTitle className="text-3xl">
              {loading ? (
                <Skeleton className="h-10 w-20" />
              ) : (
                <motion.span
                  key={stats?.total_count || 0}
                  initial={{ scale: 1.2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 100 }}
                >
                  {stats?.total_count || 0}
                </motion.span>
              )}
            </CardTitle>
          </CardHeader>
        </Card>
      </motion.div>

      {/* Sentiment Distribution Cards */}
      {["positive", "neutral", "negative"].map((sentiment, index) => (
        <motion.div key={sentiment} variants={itemVariants} custom={index}>
          <Card className="dashboard-card hover-card">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription className="flex items-center gap-2">
                  <SentimentBadge 
                    sentiment={sentiment as "positive" | "neutral" | "negative"} 
                    size="sm"
                    showLabel={false}
                  />
                  {sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}
                </CardDescription>

                {!loading && stats?.sentiment_percentages && (
                  <Badge variant="outline" className="text-xs font-normal">
                    {stats.sentiment_percentages[sentiment as keyof typeof stats.sentiment_percentages]}%
                  </Badge>
                )}
              </div>
              <CardTitle className="text-3xl">
                {loading ? (
                  <Skeleton className="h-10 w-20" />
                ) : (
                  <motion.span
                    key={stats?.sentiment_counts[sentiment as keyof typeof stats.sentiment_counts] || 0}
                    initial={{ scale: 1.2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 100 }}
                  >
                    {stats?.sentiment_counts[sentiment as keyof typeof stats.sentiment_counts] || 0}
                  </motion.span>
                )}
              </CardTitle>
            </CardHeader>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default StatsCards;
