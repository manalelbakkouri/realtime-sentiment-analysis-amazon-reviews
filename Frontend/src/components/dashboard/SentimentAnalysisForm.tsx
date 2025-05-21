
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type SentimentAnalysisFormProps = {
  predictSentiment: (text: string) => Promise<any>;
};

const SentimentAnalysisForm = ({ predictSentiment }: SentimentAnalysisFormProps) => {
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

  return (
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
  );
};

export default SentimentAnalysisForm;
