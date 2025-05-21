
import { motion } from "framer-motion";
import { useRealtimeSentiment } from "@/hooks/useSentimentData";
import StatsCards from "./dashboard/StatsCards";
import SentimentChartCard from "./dashboard/SentimentChartCard";
import SentimentAnalysisForm from "./dashboard/SentimentAnalysisForm";
import ReviewsTableCard from "./dashboard/ReviewsTableCard";

const RealtimeDashboard = () => {
  const { predictions, stats, loading, predictSentiment } = useRealtimeSentiment();

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
      {/* Stats Cards Section */}
      <StatsCards stats={stats} loading={loading} />

      {/* Charts & Analysis Form Section */}
      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        variants={containerVariants}
      >
        {/* Chart Card */}
        <motion.div variants={itemVariants}>
          <SentimentChartCard stats={stats} loading={loading} />
        </motion.div>

        {/* Analysis Form Card */}
        <motion.div variants={itemVariants}>
          <SentimentAnalysisForm predictSentiment={predictSentiment} />
        </motion.div>
      </motion.div>

      {/* Recent Reviews Table */}
      <motion.div variants={itemVariants}>
        <ReviewsTableCard predictions={predictions} loading={loading} />
      </motion.div>
    </motion.div>
  );
};

export default RealtimeDashboard;
