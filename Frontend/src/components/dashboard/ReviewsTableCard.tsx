
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowUp } from "lucide-react";
import ReviewsTable, { SentimentPrediction } from "../ReviewsTable";

type ReviewsTableCardProps = {
  predictions: SentimentPrediction[] | undefined;
  loading: boolean;
};

const ReviewsTableCard = ({ predictions, loading }: ReviewsTableCardProps) => {
  return (
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
  );
};

export default ReviewsTableCard;
