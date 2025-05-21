
import { toast } from "sonner";

const API_BASE_URL = "http://localhost:5000/api";

interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

export interface SentimentPrediction {
  _id: string;
  text: string;
  prediction: number;
  sentiment: "positive" | "neutral" | "negative";
  confidence: number;
  probabilities: number[];
  timestamp: string;
  reviewerID?: string;
  asin?: string;
  overall?: number;
  summary?: string;
  reviewTime?: string;
}

export interface SentimentStats {
  total_count: number;
  sentiment_counts: {
    positive: number;
    neutral: number;
    negative: number;
  };
  sentiment_percentages: {
    positive: number;
    neutral: number;
    negative: number;
  };
  recent_predictions: SentimentPrediction[];
}

// Generic GET request function
async function fetchAPI<T>(endpoint: string): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return { data: null, error: errorMessage };
  }
}

// Generic POST request function
async function postAPI<T>(endpoint: string, body: any): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    console.error(`Error posting to ${endpoint}:`, error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return { data: null, error: errorMessage };
  }
}

// API functions
export const apiService = {
  // Get recent predictions
  getRecentPredictions: async (limit = 50, skip = 0): Promise<ApiResponse<SentimentPrediction[]>> => {
    return fetchAPI<SentimentPrediction[]>(`/predictions?limit=${limit}&skip=${skip}`);
  },
  
  // Get sentiment statistics
  getSentimentStats: async (): Promise<ApiResponse<SentimentStats>> => {
    return fetchAPI<SentimentStats>("/stats");
  },
  
  // Post a manual prediction
  predictSentiment: async (text: string, save = true): Promise<ApiResponse<SentimentPrediction>> => {
    return postAPI<SentimentPrediction>("/predict", { text, save });
  },

  // Mock function for offline analysis data (since it's not in your backend yet)
  getOfflineAnalysisData: async (): Promise<ApiResponse<{
    sentimentOverTime: Array<{ date: string, positive: number, neutral: number, negative: number }>,
    topPositiveProducts: Array<{ asin: string, count: number, avgScore: number }>,
    topNegativeProducts: Array<{ asin: string, count: number, avgScore: number }>
  }>> => {
    // This is mock data since your backend doesn't have this endpoint yet
    const mockData = {
      sentimentOverTime: [
        { date: "2023-01", positive: 120, neutral: 50, negative: 30 },
        { date: "2023-02", positive: 150, neutral: 55, negative: 25 },
        { date: "2023-03", positive: 180, neutral: 60, negative: 20 },
        { date: "2023-04", positive: 200, neutral: 70, negative: 30 },
        { date: "2023-05", positive: 220, neutral: 65, negative: 35 },
        { date: "2023-06", positive: 250, neutral: 60, negative: 40 },
      ],
      topPositiveProducts: [
        { asin: "B00X4WHP5E", count: 120, avgScore: 4.8 },
        { asin: "B00Y2CQB5U", count: 95, avgScore: 4.7 },
        { asin: "B00ZV9RDKK", count: 87, avgScore: 4.6 },
        { asin: "B01M0NAXJ7", count: 76, avgScore: 4.5 },
        { asin: "B01LPZD1N6", count: 68, avgScore: 4.4 },
      ],
      topNegativeProducts: [
        { asin: "B01NABVWZE", count: 45, avgScore: 1.2 },
        { asin: "B01H7YCRTI", count: 38, avgScore: 1.5 },
        { asin: "B01M3OC9V6", count: 32, avgScore: 1.7 },
        { asin: "B01KNAEPEZ", count: 29, avgScore: 1.9 },
        { asin: "B01JYYGVDM", count: 24, avgScore: 2.0 },
      ]
    };
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return { data: mockData, error: null };
  }
};

export default apiService;
