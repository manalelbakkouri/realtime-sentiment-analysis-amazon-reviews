
import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface CategorySentimentChartProps {
  data: {
    name: string; // Change from 'category' to 'name'
    positive: number;
    neutral: number;
    negative: number;
  }[];
}

const CategorySentimentChart: React.FC<CategorySentimentChartProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart
        data={data}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5,
        }}
        barGap={0}
        barSize={20}
      >
        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
        <XAxis 
          dataKey="name" 
          tick={{ fill: 'var(--foreground)' }}
          axisLine={{ stroke: 'var(--border)' }}
        />
        <YAxis 
          tick={{ fill: 'var(--foreground)' }}
          axisLine={{ stroke: 'var(--border)' }}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'var(--card)',
            borderColor: 'var(--border)',
            color: 'var(--card-foreground)',
            borderRadius: '8px'
          }} 
        />
        <Legend />
        <Bar dataKey="positive" fill="#0EA5E9" radius={[4, 4, 0, 0]} />
        <Bar dataKey="neutral" fill="#FFC107" radius={[4, 4, 0, 0]} />
        <Bar dataKey="negative" fill="#EF4444" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default CategorySentimentChart;
