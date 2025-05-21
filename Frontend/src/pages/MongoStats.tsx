
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import SentimentBarChart from '@/components/charts/SentimentBarChart';
import SentimentPieChart from '@/components/charts/SentimentPieChart';
import { useMongoSentiment } from '@/hooks/useMongoSentiment';
import { Skeleton } from '@/components/ui/skeleton';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function MongoStats() {
  const { stats, timeline, topProducts, loading } = useMongoSentiment();

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold mb-6">Statistiques MongoDB</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Carte des statistiques générales */}
        <Card>
          <CardHeader>
            <CardTitle>Vue d'ensemble des sentiments</CardTitle>
            <CardDescription>Distribution des sentiments dans les reviews</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            {loading ? (
              <div className="flex flex-col space-y-3">
                <Skeleton className="h-[250px] w-full rounded-xl" />
              </div>
            ) : (
              <SentimentPieChart 
                data={{
                  positive: stats.sentiment_counts.positive,
                  neutral: stats.sentiment_counts.neutral,
                  negative: stats.sentiment_counts.negative
                }}
              />
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <div>Total: {loading ? <Skeleton className="h-4 w-[50px]" /> : stats.total_count}</div>
            <div>Mise à jour: {new Date().toLocaleTimeString()}</div>
          </CardFooter>
        </Card>

        {/* Carte d'évolution temporelle */}
        <Card>
          <CardHeader>
            <CardTitle>Évolution des sentiments</CardTitle>
            <CardDescription>Tendance sur la période d'analyse</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            {loading ? (
              <div className="flex flex-col space-y-3">
                <Skeleton className="h-[250px] w-full rounded-xl" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timeline}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="positive" stroke="#10b981" activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="neutral" stroke="#6b7280" />
                  <Line type="monotone" dataKey="negative" stroke="#ef4444" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Produits les mieux notés */}
        <Card>
          <CardHeader>
            <CardTitle>Top Produits Positifs</CardTitle>
            <CardDescription>Produits avec le plus d'avis positifs</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <ul className="space-y-2">
                {topProducts.topPositive && topProducts.topPositive.map((product: any, index: number) => (
                  <li key={index} className="flex justify-between items-center p-2 border-b">
                    <span className="font-medium">ASIN: {product.asin}</span>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded">{product.count}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Produits les moins bien notés */}
        <Card>
          <CardHeader>
            <CardTitle>Top Produits Négatifs</CardTitle>
            <CardDescription>Produits avec le plus d'avis négatifs</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <ul className="space-y-2">
                {topProducts.topNegative && topProducts.topNegative.map((product: any, index: number) => (
                  <li key={index} className="flex justify-between items-center p-2 border-b">
                    <span className="font-medium">ASIN: {product.asin}</span>
                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded">{product.count}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
