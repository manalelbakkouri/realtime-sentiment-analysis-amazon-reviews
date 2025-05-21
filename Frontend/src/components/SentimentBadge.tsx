
import { CircleCheck, CircleX, CircleDot } from "lucide-react";

type SentimentBadgeProps = {
  sentiment: "positive" | "neutral" | "negative";
  showIcon?: boolean;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
};

const SentimentBadge = ({ 
  sentiment, 
  showIcon = true, 
  showLabel = true,
  size = "md" 
}: SentimentBadgeProps) => {
  // Define classes based on size
  const sizeClasses = {
    sm: "px-1.5 py-0.5 text-xs",
    md: "px-2 py-1 text-xs",
    lg: "px-3 py-1.5 text-sm"
  };
  
  // Define icon size based on badge size
  const iconSize = {
    sm: 12,
    md: 14,
    lg: 16
  };

  // Get the appropriate icon
  const Icon = () => {
    switch (sentiment) {
      case "positive":
        return <CircleCheck size={iconSize[size]} />;
      case "neutral":
        return <CircleDot size={iconSize[size]} />;
      case "negative":
        return <CircleX size={iconSize[size]} />;
      default:
        return null;
    }
  };

  return (
    <span
      className={`
        inline-flex items-center font-medium rounded-full
        ${sizeClasses[size]}
        ${
          sentiment === "positive"
            ? "bg-sentiment-positive text-white"
            : sentiment === "neutral"
            ? "bg-sentiment-neutral text-black"
            : "bg-sentiment-negative text-white"
        }
      `}
    >
      {showIcon && <span className="mr-1"><Icon /></span>}
      {showLabel && sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}
    </span>
  );
};

export default SentimentBadge;
