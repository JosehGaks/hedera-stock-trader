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
// Import date adapter for Chart.js time scale
import 'chartjs-adapter-date-fns';
import { TokenMetadataService } from '../../services/tokenMetadata';

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
  timeRange?: string;
}

interface ChartData {
  timestamp: string;
  price: number;
}

export function PriceChart({ tokenId, isUSStock, timeRange = '1D' }: PriceChartProps) {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stockSymbol, setStockSymbol] = useState<string | null>(null);

  useEffect(() => {
    const fetchPriceHistory = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // First get the stock symbol from the token ID
        const stocksResponse = await fetch('/api/stocks');
        if (!stocksResponse.ok) {
          throw new Error('Failed to fetch stocks');
        }

        const stocks = await stocksResponse.json();
        const stock = stocks.find((s: any) => s.tokenId === tokenId);
        
        if (!stock) {
          throw new Error(`Stock not found for token ID: ${tokenId}`);
        }

        setStockSymbol(stock.symbol);

        let data: ChartData[] = [];

        if (isUSStock) {
          try {
            // Fetch from Alpha Vantage for US stocks
            const apiKey = '8HWPATEHPA5S7KI7'; // Replace with your API key
            const endpoint = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${stock.symbol}&interval=5min&apikey=${apiKey}`;
            
            const response = await fetch(endpoint);
            if (!response.ok) {
              throw new Error('Failed to fetch from Alpha Vantage');
            }
            
            const result = await response.json();
            
            // Check if we have valid time series data
            if (result['Time Series (5min)']) {
              const timeSeries = result['Time Series (5min)'];
              data = Object.entries(timeSeries).map(([timestamp, values]) => ({
                timestamp,
                price: parseFloat((values as any)['4. close'])
              })).reverse();
            } else {
              // If Alpha Vantage fails or rate limits, fall back to mock data
              throw new Error('No valid time series data');
            }
          } catch (error) {
            console.warn('Alpha Vantage API error, using mock data:', error);
            data = generateMockChartData();
          }
        } else {
          try {
            // Fetch from TokenMetadataService for African stocks
            const tokenMetadataService = TokenMetadataService.getInstance();
            const priceHistory = await tokenMetadataService.getPriceHistory(tokenId);
            
            if (priceHistory && priceHistory.length > 0) {
              data = priceHistory;
            } else {
              throw new Error('No price history available');
            }
          } catch (error) {
            console.warn('TokenMetadataService error, using mock data:', error);
            data = generateMockChartData();
          }
        }

        setChartData(data);
      } catch (error) {
        console.error('Error fetching price history:', error);
        setError('Failed to load price history');
        // Still provide mock data for demo purposes
        setChartData(generateMockChartData());
      } finally {
        setIsLoading(false);
      }
    };

    // Generate mock chart data when API fails
    const generateMockChartData = () => {
      const mockData: ChartData[] = [];
      const now = new Date();
      const basePrice = 100 + Math.random() * 200;
      
      // Generate data points based on selected time range
      let dataPoints = 288; // Default to 1 day (5-min intervals)
      let interval = 5 * 60 * 1000; // 5 minutes in milliseconds
      
      switch(timeRange) {
        case '1W':
          dataPoints = 168; // 1 week with hourly data
          interval = 60 * 60 * 1000;
          break;
        case '1M':
          dataPoints = 30; // 1 month with daily data
          interval = 24 * 60 * 60 * 1000;
          break;
        case '1Y':
          dataPoints = 52; // 1 year with weekly data
          interval = 7 * 24 * 60 * 60 * 1000;
          break;
        default: // 1D
          dataPoints = 288;
          interval = 5 * 60 * 1000;
      }
      
      // Create a trend pattern - generally upward with some variability
      let trendDirection = Math.random() > 0.5 ? 1 : -1; // random initial trend
      let prevPrice = basePrice;
      
      for (let i = 0; i < dataPoints; i++) {
        // Occasionally change trend direction
        if (i % 20 === 0) {
          trendDirection = Math.random() > 0.6 ? 1 : -1;
        }
        
        // Calculate time for this data point
        const time = new Date(now.getTime() - (dataPoints - i) * interval);
        
        // Generate price with some randomness but following the trend
        const randomFactor = Math.random() * 5 - 2.5;
        const trendFactor = trendDirection * (i / dataPoints) * 10;
        const price = prevPrice + randomFactor + (trendFactor / dataPoints);
        prevPrice = Math.max(price, basePrice * 0.7); // Ensure price doesn't go too low
        
        mockData.push({
          timestamp: time.toISOString(),
          price: prevPrice
        });
      }
      
      return mockData;
    };

    if (tokenId) {
      fetchPriceHistory();
    }
  }, [tokenId, isUSStock, timeRange]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error && chartData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 p-4 bg-red-50 rounded-lg">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  const data = {
    labels: chartData.map(point => new Date(point.timestamp)),
    datasets: [
      {
        label: stockSymbol || 'Price',
        data: chartData.map(point => point.price),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        pointRadius: 0, // Hide individual data points for cleaner look
        pointHoverRadius: 5, // Show points on hover
        pointHoverBackgroundColor: 'rgb(59, 130, 246)',
        pointHoverBorderColor: 'white',
        pointHoverBorderWidth: 2,
        tension: 0.2,
        fill: true,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        callbacks: {
          label: function(context: any) {
            return `$${context.parsed.y.toFixed(2)}`;
          },
          title: function(context: any) {
            const date = new Date(context[0].label);
            return date.toLocaleString();
          }
        }
      },
    },
    scales: {
      x: {
        type: 'time' as const,
        time: {
          unit: timeRange === '1D' ? 'hour' : 
                timeRange === '1W' ? 'day' : 
                timeRange === '1M' ? 'day' : 'month' as 'hour' | 'day' | 'month'
        },
        ticks: {
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 6,
        },
        grid: {
          display: false,
        }
      },
      y: {
        position: 'right' as const,
        ticks: {
          callback: function(value: any) {
            return '$' + value.toFixed(2);
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        }
      }
    },
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    animation: {
      duration: 1000,
    },
  };

  const chartHeight = "h-80"; // Fixed height for chart

  return (
    <div>
      <div className={chartHeight}>
        <Line data={data} options={options} />
      </div>
      <div className="mt-4 flex justify-between text-sm text-gray-500">
        <div>
          Open: <span className="text-gray-700 font-medium">${chartData[0]?.price.toFixed(2) || '0.00'}</span>
        </div>
        <div>
          Close: <span className="text-gray-700 font-medium">${chartData[chartData.length-1]?.price.toFixed(2) || '0.00'}</span>
        </div>
        <div>
          {(() => {
            const firstPrice = chartData[0]?.price || 0;
            const lastPrice = chartData[chartData.length-1]?.price || 0;
            const change = lastPrice - firstPrice;
            const percentChange = firstPrice ? (change / firstPrice) * 100 : 0;
            return (
              <>
                Change: <span className={`font-medium ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {change >= 0 ? '+' : ''}{change.toFixed(2)} ({percentChange.toFixed(2)}%)
                </span>
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
} 