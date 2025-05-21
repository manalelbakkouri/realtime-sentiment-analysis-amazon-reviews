
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

type SentimentCount = {
  name: string;
  value: number;
  color: string;
};

type SentimentPieChartProps = {
  data: {
    positive: number;
    neutral: number;
    negative: number;
  };
  height?: number;
};

const SentimentPieChart = ({ data, height = 300 }: SentimentPieChartProps) => {
  // Transform data into the format expected by recharts
  const chartData: SentimentCount[] = [
    { name: 'Positive', value: data.positive, color: '#0EA5E9' },
    { name: 'Neutral', value: data.neutral, color: '#FFC107' },
    { name: 'Negative', value: data.negative, color: '#EF4444' }
  ];

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip 
          formatter={(value) => [`${value} reviews`, 'Count']}
          contentStyle={{ 
            backgroundColor: 'rgba(26, 31, 44, 0.8)',
            borderColor: '#444',
            borderRadius: '8px',
            color: '#FFF'
          }} 
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default SentimentPieChart;
