
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useRealtimeSentiment } from "@/hooks/useSentimentData";
import SentimentPieChart from "./charts/SentimentPieChart";
import ReviewsTable from "./ReviewsTable";
import SentimentBadge from "./SentimentBadge";
import { ArrowUp, MessageSquare } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";

const RealtimeDashboard = () => {
  const { predictions, stats, loading, predictSentiment } = useRealtimeSentiment();
  const [reviewText, setReviewText] = useState("");
  const [predicting, setPredicting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewText.trim()) {
      toast({
        title: "Empty review",
        description: "Please enter some text to analyze",
        variant: "destructive",
      });
      return;
    }

    try {
      setPredicting(true);
      const result = await predictSentiment(reviewText);
      toast({
        title: "Analysis Complete",
        description: `Sentiment detected: ${result?.prediction?.sentiment || "Unknown"}`,
      });
      setReviewText("");
    } catch (error) {
      console.error("Prediction error:", error);
    } finally {
      setPredicting(false);
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

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  return (
    <motion.div 
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
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

      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        variants={containerVariants}
      >
        {/* Chart Card */}
        <motion.div variants={itemVariants}>
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
        </motion.div>

        {/* Manual Analysis Card */}
        <motion.div variants={itemVariants}>
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                <span>Analyze New Review</span>
              </CardTitle>
              <CardDescription>Enter text to predict sentiment</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Textarea
                    placeholder="Enter review text..."
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    className="min-h-32 resize-none py-2"
                  />
                </div>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button 
                    type="submit" 
                    disabled={predicting || !reviewText.trim()} 
                    className="w-full transition-all duration-300"
                  >
                    {predicting ? "Analyzing..." : "Analyze Sentiment"}
                  </Button>
                </motion.div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Recent Reviews Table */}
      <motion.div variants={itemVariants}>
        <Card className="dashboard-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Reviews</CardTitle>
              <CardDescription>Latest processed reviews with sentiment analysis</CardDescription>
            </div>
            {/* Auto-refresh indicator */}
            <Badge variant="outline" className="flex items-center gap-1 animate-pulse-subtle">
              <ArrowUp className="h-3 w-3" />
              <span className="text-xs">Live updates</span>
            </Badge>
          </CardHeader>
          <CardContent>
            {loading && (!predictions || predictions.length === 0) ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-4 flex-1" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                ))}
              </div>
            ) : (
              <ReviewsTable reviews={predictions} />
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default RealtimeDashboard;