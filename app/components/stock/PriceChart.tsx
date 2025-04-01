'use client';

import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { AlphaVantageService } from '../../services/alphaVantage';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

interface PriceChartProps {
  tokenId: string;
  isUSStock: boolean;
}

interface ChartData {
  timestamp: string;
  price: number;
}

export function PriceChart({ tokenId, isUSStock }: PriceChartProps) {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPriceHistory = async () => {
      if (!isUSStock) {
        setError('Price chart is only available for US stocks');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const history = await AlphaVantageService.getInstance().getIntradayData(tokenId);
        if (!history || !history['Time Series (5min)']) {
          throw new Error('Failed to fetch price history');
        }
        const timeSeriesData = history['Time Series (5min)'];
        const chartData: ChartData[] = Object.entries(timeSeriesData)
          .map(([timestamp, values]: [string, any]) => ({
            timestamp,
            price: parseFloat(values['4. close'])
          }))
          .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

        setChartData(chartData);
      } catch (error) {
        console.error('Failed to fetch price history:', error);
        setError('Failed to load price chart');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPriceHistory();
    const interval = setInterval(fetchPriceHistory, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [tokenId, isUSStock]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  const data = {
    labels: chartData.map(point => new Date(point.timestamp)),
    datasets: [
      {
        label: 'Price',
        data: chartData.map(point => point.price),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.1
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: 'time' as const,
        time: {
          unit: 'minute' as const
        }
      },
      y: {
        beginAtZero: false
      }
    },
    plugins: {
      legend: {
        display: false
      }
    }
  };

  return (
    <div className="h-64">
      <Line data={data} options={options} />
    </div>
  );
} 