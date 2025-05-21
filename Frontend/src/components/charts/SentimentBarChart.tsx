
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

type SentimentBarChartProps = {
  data: Array<{
    name: string;
    positive: number;
    neutral: number;
    negative: number;
  }>;
  height?: number;
};

const SentimentBarChart = ({ data, height = 300 }: SentimentBarChartProps) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#444" />
        <XAxis dataKey="name" stroke="#999" />
        <YAxis stroke="#999" />
        <Tooltip
          contentStyle={{ 
            backgroundColor: 'rgba(26, 31, 44, 0.8)',
            borderColor: '#444',
            borderRadius: '8px',
            color: '#FFF'
          }}
        />
        <Legend />
        <Bar dataKey="positive" stackId="a" fill="#0EA5E9" name="Positive" />
        <Bar dataKey="neutral" stackId="a" fill="#FFC107" name="Neutral" />
        <Bar dataKey="negative" stackId="a" fill="#EF4444" name="Negative" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default SentimentBarChart;
