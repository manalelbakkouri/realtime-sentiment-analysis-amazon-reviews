
import { SentimentPrediction } from '@/components/ReviewsTable';

// Données de prédiction simulées
export const mockPredictions: SentimentPrediction[] = [
  {
    _id: "1",
    text: "Not much to write about here, but it does exactly what it's supposed to. filters out the pop sounds.",
    sentiment: "positive",
    prediction: 0.95,
    confidence: 0.95,
    probabilities: [0.05, 0.0, 0.95],
    timestamp: new Date().toISOString(),
    reviewerID: "A2IBPI20UZIR0U",
    asin: "1384719342",
    overall: 5.0,
    summary: "good"
  },
  {
    _id: "2",
    text: "The product does exactly as it should and is quite affordable.",
    sentiment: "positive",
    prediction: 0.92,
    confidence: 0.92,
    probabilities: [0.03, 0.05, 0.92],
    timestamp: new Date().toISOString(),
    reviewerID: "A14VAT5EAX3D9S",
    asin: "1384719342",
    overall: 5.0,
    summary: "Jake"
  },
  {
    _id: "3",
    text: "Didn't fit my 1996 Fender Strat...",
    sentiment: "negative",
    prediction: 0.78,
    confidence: 0.78,
    probabilities: [0.78, 0.15, 0.07],
    timestamp: new Date().toISOString(),
    reviewerID: "AJNFQI3YR6XJ5",
    asin: "B00004Y2UT",
    overall: 3.0,
    summary: "Didn't fit my 1996 Fender Strat..."
  }
];

// Statistiques simulées
export const mockStats = {
  total_count: 1247,
  sentiment_counts: {
    positive: 847,
    neutral: 215,
    negative: 185
  },
  sentiment_percentages: {
    positive: 68,
    neutral: 17,
    negative: 15
  }
};

// Timeline simulée pour le graphique d'évolution
export const mockTimeline = [
  { date: "2023-01", positive: 72, neutral: 18, negative: 10 },
  { date: "2023-02", positive: 65, neutral: 20, negative: 15 },
  { date: "2023-03", positive: 70, neutral: 15, negative: 15 },
  { date: "2023-04", positive: 75, neutral: 15, negative: 10 },
  { date: "2023-05", positive: 68, neutral: 17, negative: 15 },
  { date: "2023-06", positive: 72, neutral: 16, negative: 12 }
];

// Top produits simulés
export const mockTopProducts = {
  topPositive: [
    { asin: "1384719342", count: 45, name: "Microphone Pop Filter" },
    { asin: "B00004Y2UT", count: 32, name: "Monster Cable" },
    { asin: "B00005ML71", count: 28, name: "Keyboard Pedal" },
    { asin: "B000068NSX", count: 24, name: "Audio Interface" },
    { asin: "B0002E1S5A", count: 20, name: "Video Camera" }
  ],
  topNegative: [
    { asin: "B000067RC4", count: 15, name: "Wireless Adapter" },
    { asin: "B00006JP4Q", count: 12, name: "Power Supply" },
    { asin: "B000057SPK", count: 10, name: "USB Cable" },
    { asin: "B00006JPSQ", count: 8, name: "MIDI Controller" },
    { asin: "B00007EDM7", count: 7, name: "Audio Recorder" }
  ]
};
