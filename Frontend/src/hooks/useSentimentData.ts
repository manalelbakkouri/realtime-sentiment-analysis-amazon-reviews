import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import reviewsData from "../data/DATA.json";
import { SentimentPrediction } from "@/components/ReviewsTable";

interface SentimentData {
  positive: number;
  negative: number;
  neutral: number;
}

interface CategorySentiment {
  category: string;
  positive: number;
  negative: number;
  neutral: number;
}

interface ProductSentiment {
  product: string;
  positive: number;
  negative: number;
  neutral: number;
}

// Convert our JSON data to the SentimentPrediction format
const processSentimentData = (): SentimentPrediction[] => {
  return reviewsData.map((review: any) => {
    // Simple sentiment analysis based on overall rating
    let sentiment: "positive" | "neutral" | "negative" = "neutral";
    if (review.overall >= 4) {
      sentiment = "positive";
    } else if (review.overall <= 2) {
      sentiment = "negative";
    }

    // Calculate a fake confidence based on the extremity of the rating
    let confidence = 0;
    if (review.overall === 5 || review.overall === 1) {
      confidence = 0.9;
    } else if (review.overall === 4 || review.overall === 2) {
      confidence = 0.7;
    } else {
      confidence = 0.6;
    }

    return {
      _id: review.reviewerID || String(Math.random()),
      text: review.reviewText || "",
      sentiment: sentiment,
      prediction: confidence,
      confidence: confidence,
      timestamp: new Date(review.unixReviewTime * 1000).toISOString(),
      probabilities: [0.3, 0.3, 0.4],
      reviewerID: review.reviewerID,
      asin: review.asin,
      overall: review.overall,
      summary: review.summary,
      reviewTime: review.reviewTime
    };
  });
};

// Generate stats from the sentiment data
const generateStats = (sentimentData: SentimentPrediction[]) => {
  const counts = {
    positive: 0,
    neutral: 0,
    negative: 0,
  };
  
  sentimentData.forEach(item => {
    counts[item.sentiment]++;
  });
  
  const total = sentimentData.length;
  
  return {
    total_count: total,
    sentiment_counts: counts,
    sentiment_percentages: {
      positive: Math.round((counts.positive / total) * 100),
      neutral: Math.round((counts.neutral / total) * 100),
      negative: Math.round((counts.negative / total) * 100),
    },
    processedToday: total,
    accuracyRate: 0.94,
    avgProcessingTime: "0.31s",
  };
};

// Mock data for offline analysis using our real data
const generateOfflineData = (sentimentData: SentimentPrediction[]) => {
  // Generate time-series data based on review dates
  const timeSeriesMap = new Map();
  
  sentimentData.forEach(review => {
    const date = new Date(review.timestamp);
    const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!timeSeriesMap.has(monthYear)) {
      timeSeriesMap.set(monthYear, { positive: 0, neutral: 0, negative: 0 });
    }
    
    timeSeriesMap.get(monthYear)[review.sentiment]++;
  });
  
  const sentimentOverTime = Array.from(timeSeriesMap).map(([date, counts]) => ({
    date,
    ...counts
  })).sort((a, b) => a.date.localeCompare(b.date));
  
  // Group by product ASIN to find top positive/negative products
  const productSentiments = new Map();
  
  sentimentData.forEach(review => {
    if (!review.asin) return;
    
    if (!productSentiments.has(review.asin)) {
      productSentiments.set(review.asin, { positive: 0, neutral: 0, negative: 0, total: 0 });
    }
    
    productSentiments.get(review.asin)[review.sentiment]++;
    productSentiments.get(review.asin).total++;
  });
  
  // Convert to arrays sorted by sentiment counts
  const products = Array.from(productSentiments.entries()).map(([asin, counts]) => ({
    asin,
    ...counts
  }));
  
  const topPositiveProducts = [...products]
    .sort((a, b) => b.positive - a.positive)
    .slice(0, 5)
    .map(product => ({ asin: product.asin, count: product.positive }));
    
  const topNegativeProducts = [...products]
    .sort((a, b) => b.negative - a.negative)
    .slice(0, 5)
    .map(product => ({ asin: product.asin, count: product.negative }));
    
  return {
    sentimentOverTime,
    topPositiveProducts,
    topNegativeProducts
  };
};

export const useSentimentData = (refreshInterval?: number) => {
  const [sentimentData, setSentimentData] = useState<SentimentData>({
    positive: 0,
    negative: 0,
    neutral: 0,
  });
  const [categorySentimentData, setCategorySentimentData] = useState<CategorySentiment[]>([]);
  const [productSentimentData, setProductSentimentData] = useState<ProductSentiment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Simulate fetching data from an API
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const mockSentimentData: SentimentData = {
        positive: Math.floor(Math.random() * 100),
        negative: Math.floor(Math.random() * 100),
        neutral: Math.floor(Math.random() * 100),
      };

      const mockCategorySentimentData: CategorySentiment[] = [
        { category: "Category A", positive: Math.floor(Math.random() * 100), negative: Math.floor(Math.random() * 100), neutral: Math.floor(Math.random() * 100) },
        { category: "Category B", positive: Math.floor(Math.random() * 100), negative: Math.floor(Math.random() * 100), neutral: Math.floor(Math.random() * 100) },
        { category: "Category C", positive: Math.floor(Math.random() * 100), negative: Math.floor(Math.random() * 100), neutral: Math.floor(Math.random() * 100) },
      ];

      const mockProductSentimentData: ProductSentiment[] = [
        { product: "Product X", positive: Math.floor(Math.random() * 100), negative: Math.floor(Math.random() * 100), neutral: Math.floor(Math.random() * 100) },
        { product: "Product Y", positive: Math.floor(Math.random() * 100), negative: Math.floor(Math.random() * 100), neutral: Math.floor(Math.random() * 100) },
        { product: "Product Z", positive: Math.floor(Math.random() * 100), negative: Math.floor(Math.random() * 100), neutral: Math.floor(Math.random() * 100) },
      ];

      setSentimentData(mockSentimentData);
      setCategorySentimentData(mockCategorySentimentData);
      setProductSentimentData(mockProductSentimentData);
      setError(null);
    } catch (err: any) {
      setError(err.message || "An error occurred while fetching data");
      toast({
        title: "Error",
        description: "Failed to update dashboard data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const refreshData = () => {
    fetchData();
  };

  return {
    sentimentData,
    categorySentimentData,
    productSentimentData,
    isLoading,
    error,
    refreshData,
  };
};

// Add the missing useOfflineAnalysisData hook
export const useOfflineAnalysisData = () => {
  const processedData = processSentimentData();
  const [data, setData] = useState(generateOfflineData(processedData));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOfflineData = async () => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));
        setData(generateOfflineData(processedData));
        setError(null);
      } catch (err: any) {
        setError(err.message || "Failed to fetch offline analysis data");
      } finally {
        setLoading(false);
      }
    };

    fetchOfflineData();
  }, []);

  return { data, loading, error };
};

// Add the useRealtimeSentiment hook to provide real-time prediction data
export const useRealtimeSentiment = () => {
  const processedData = processSentimentData();
  const [predictions, setPredictions] = useState<SentimentPrediction[]>(processedData.slice(0, 3));
  const [stats, setStats] = useState(generateStats(processedData));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPredictions = async () => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 600));
        setPredictions(processedData.slice(0, 3));
        setStats(generateStats(processedData));
      } finally {
        setLoading(false);
      }
    };

    loadPredictions();
    
    // Simulate real-time updates
    const interval = setInterval(() => {
      // Randomly update one of the predictions to simulate real-time changes
      const randomIndex = Math.floor(Math.random() * predictions.length);
      const randomSentiment: "positive" | "neutral" | "negative" = 
        ["positive", "neutral", "negative"][Math.floor(Math.random() * 3)] as "positive" | "neutral" | "negative";
      const randomProbability = (0.7 + Math.random() * 0.3).toFixed(2);
      
      setPredictions(prev => {
        const updated = [...prev];
        updated[randomIndex] = {
          ...updated[randomIndex],
          sentiment: randomSentiment,
          confidence: parseFloat(randomProbability),
          prediction: parseFloat(randomProbability),
          timestamp: new Date().toISOString()
        };
        return updated;
      });
      
      // Update stats randomly
      setStats(prev => ({
        ...prev,
        processedToday: prev.processedToday + Math.floor(Math.random() * 5),
        accuracyRate: parseFloat((prev.accuracyRate + (Math.random() * 0.02 - 0.01)).toFixed(2))
      }));
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Function to predict sentiment of custom text
  const predictSentiment = async (text: string) => {
    setLoading(true);
    try {
      // Simulate API call for sentiment prediction
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate mock prediction based on text length and content
      const hasPositiveWords = /great|excellent|good|love|amazing/i.test(text);
      const hasNegativeWords = /bad|poor|terrible|hate|awful/i.test(text);
      
      let sentiment: "positive" | "neutral" | "negative";
      if (hasPositiveWords) sentiment = "positive";
      else if (hasNegativeWords) sentiment = "negative";
      else sentiment = ["positive", "neutral", "negative"][Math.floor(Math.random() * 3)] as "positive" | "neutral" | "negative";
      
      const probability = 0.7 + Math.random() * 0.3;
      
      const newPrediction: SentimentPrediction = {
        _id: Date.now().toString(),
        text,
        sentiment,
        prediction: probability,
        confidence: probability,
        probabilities: [0.1, 0.1, 0.8],
        timestamp: new Date().toISOString()
      };
      
      setPredictions(prev => [newPrediction, ...prev.slice(0, 2)]);
      
      return { 
        success: true, 
        prediction: newPrediction
      };
    } catch (error) {
      return {
        success: false,
        error: "Failed to predict sentiment"
      };
    } finally {
      setLoading(false);
    }
  };

  return { predictions, stats, loading, predictSentiment };
};
