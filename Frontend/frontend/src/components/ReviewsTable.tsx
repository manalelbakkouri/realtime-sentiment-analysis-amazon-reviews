
import { useEffect, useState } from "react";
import SentimentBadge from "./SentimentBadge";
import { Badge } from "@/components/ui/badge";

// Define the type for SentimentPrediction based on what we're using
export interface SentimentPrediction {
  _id: string;
  text: string;
  prediction: number;
  sentiment: "positive" | "neutral" | "negative";
  confidence: number;
  probabilities?: number[];
  timestamp: string;
  reviewerID?: string;
  asin?: string;
  overall?: number;
  summary?: string;
  reviewTime?: string;
}

type ReviewsTableProps = {
  reviews: SentimentPrediction[] | undefined;
  className?: string;
};

const ReviewsTable = ({ reviews = [], className = "" }: ReviewsTableProps) => {
  const [displayedReviews, setDisplayedReviews] = useState<SentimentPrediction[]>([]);

  // Animate new reviews
  useEffect(() => {
    setDisplayedReviews(reviews || []);
  }, [reviews]);

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString();
    } catch (e) {
      return timestamp;
    }
  };

  // Truncate long text
  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <div className={`overflow-auto ${className}`}>
      <table className="w-full">
        <thead>
          <tr className="text-left text-muted-foreground border-b border-border">
            <th className="pb-2 font-medium">Sentiment</th>
            <th className="pb-2 font-medium">Review Text</th>
            <th className="pb-2 font-medium">Score</th>
            <th className="pb-2 font-medium">Time</th>
          </tr>
        </thead>
        <tbody>
          {displayedReviews.length > 0 ? (
            displayedReviews.map((review) => (
              <tr
                key={review._id}
                className="border-b border-border hover:bg-dashboard-card/60 transition-colors animate-fade-in"
              >
                <td className="py-3 pr-4">
                  <SentimentBadge sentiment={review.sentiment} />
                </td>
                <td className="py-3 pr-4 max-w-sm">
                  <div className="line-clamp-2">{truncateText(review.text)}</div>
                </td>
                <td className="py-3 pr-4">
                  {review.overall ? (
                    <Badge variant="outline" className="font-bold">
                      {review.overall}/5
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground">
                      N/A
                    </Badge>
                  )}
                </td>
                <td className="py-3 text-muted-foreground text-sm">
                  {formatTimestamp(review.timestamp)}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4} className="py-8 text-center text-muted-foreground">
                No reviews available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ReviewsTable;