import React from 'react';
import { motion } from 'framer-motion';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface ChartProps {
  data: {
    labels: string[];
    data: number[];
  };
  type?: 'line' | 'bar' | 'doughnut';
  title: string;
}

export const Chart: React.FC<ChartProps> = ({ data, type = 'line', title }) => {
  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: title,
        data: data.data,
        borderColor: '#7c6bff',
        backgroundColor: type === 'doughnut' 
          ? ['#7c6bff', '#4fffb8', '#ff6b8a', '#ffd166', '#a78bfa', '#06b6d4', '#14b8a6', '#f97316']
          : 'rgba(124, 107, 255, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: type === 'doughnut' ? {} : {
      y: {
        beginAtZero: true,
        ticks: { color: 'rgba(240, 238, 255, 0.45)' },
        grid: { color: 'rgba(255, 255, 255, 0.07)' },
      },
      x: {
        ticks: { color: 'rgba(240, 238, 255, 0.45)' },
        grid: { color: 'rgba(255, 255, 255, 0.07)' },
      },
    },
  };

  const renderChart = () => {
    switch (type) {
      case 'bar':
        return <Bar data={chartData} options={options} />;
      case 'doughnut':
        return <Doughnut data={chartData} options={options} />;
      default:
        return <Line data={chartData} options={options} />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card h-80"
    >
      <h3 className="font-semibold mb-4">{title}</h3>
      {renderChart()}
    </motion.div>
  );
};

export default Chart;
