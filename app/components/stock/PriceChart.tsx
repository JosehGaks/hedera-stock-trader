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
  TimeScale,
  ChartOptions,
  ChartData as ChartJSData,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
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

interface IntradayData {
  'Time Series (5min)': {
    [key: string]: {
      '1. open': string;
      '2. high': string;
      '3. low': string;
      '4. close': string;
      '5. volume': string;
    };
  };
}

interface ChartData {
  timestamp: Date;
  price: number;
}

interface ChartPoint {
  x: Date;
  y: number;
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

        const history = await AlphaVantageService.getInstance().getPriceHistory(tokenId);
        const timeSeriesData = (history as IntradayData)['Time Series (5min)'];
        const chartData: ChartData[] = Object.entries(timeSeriesData)
          .map(([timestamp, values]) => ({
            timestamp: new Date(timestamp),
            price: parseFloat(values['4. close']),
          }))
          .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

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
      <div className="h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-64 flex items-center justify-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center">
        <p className="text-gray-500">No price data available</p>
      </div>
    );
  }

  const chartJSData: ChartJSData<'line', ChartPoint[]> = {
    datasets: [
      {
        label: 'Price',
        data: chartData.map((point) => ({
          x: point.timestamp,
          y: point.price,
        })),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.1,
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: (context) => `$${context.parsed.y.toFixed(2)}`,
        },
      },
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'hour',
          displayFormats: {
            hour: 'HH:mm',
          },
        },
        title: {
          display: true,
          text: 'Time',
        },
      },
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: 'Price ($)',
        },
        ticks: {
          callback: (value: number | string) => {
            if (typeof value === 'number') {
              return `$${value.toFixed(2)}`;
            }
            return value;
          },
        },
      },
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false,
    },
  };

  return (
    <div className="h-64">
      <Line data={chartJSData} options={options} />
    </div>
  );
} 