
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

type SentimentLineChartProps = {
  data: Array<{
    date: string;
    positive: number;
    neutral: number;
    negative: number;
  }>;
  height?: number;
};

const SentimentLineChart = ({ data, height = 300 }: SentimentLineChartProps) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart
        data={data}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#444" />
        <XAxis dataKey="date" stroke="#999" />
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
        <Line type="monotone" dataKey="positive" stroke="#0EA5E9" activeDot={{ r: 8 }} name="Positive" />
        <Line type="monotone" dataKey="neutral" stroke="#FFC107" activeDot={{ r: 8 }} name="Neutral" />
        <Line type="monotone" dataKey="negative" stroke="#EF4444" activeDot={{ r: 8 }} name="Negative" />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default SentimentLineChart;
