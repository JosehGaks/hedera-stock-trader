'use client';

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/auth';
import { HederaService } from '../../services/hedera';
import { PriceService } from '../../services/price';
import { Stock } from '../../types/stock';

// Define a simplified stock type for demo purposes
interface DemoStock {
  tokenId: string;
  name: string;
  symbol: string;
  description: string;
  sector: string;
  country: string;
  market: string;
  logo: string;
  price: number;
  marketCap: number;
  volume: number;
  mockPrice: number;
  isUSStock: boolean;
  [key: string]: any; // Allow additional properties to satisfy the Stock interface
}

interface PortfolioItem {
  stock: Stock | DemoStock;
  balance: number;
  value: number;
  change24h: number;
}

export function PortfolioView() {
  const { user } = useAuthStore();
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [demoMode, setDemoMode] = useState(true); // Enable demo mode by default for the MVP

  const hederaService = HederaService.getInstance();
  const priceService = PriceService.getInstance();

  // Generate demo portfolio data for MVP
  const generateDemoPortfolio = (): PortfolioItem[] => {
    return [
      {
        stock: {
          tokenId: 'AAPL',
          name: 'Apple Inc',
          symbol: 'AAPL',
          description: 'Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide.',
          sector: 'Technology',
          country: 'United States',
          market: 'NASDAQ',
          logo: 'https://logo.clearbit.com/apple.com',
          price: 175.23,
          marketCap: 2800000000000,
          volume: 55000000,
          mockPrice: 175.23,
          isUSStock: true,
          priceHistory: [],
          volume24h: 0,
        },
        balance: 10.5,
        value: 1839.92,
        change24h: 1.2,
      },
      {
        stock: {
          tokenId: 'MSFT',
          name: 'Microsoft Corporation',
          symbol: 'MSFT',
          description: 'Microsoft Corporation develops, licenses, and supports software, services, devices, and solutions worldwide.',
          sector: 'Technology',
          country: 'United States',
          market: 'NASDAQ',
          logo: 'https://logo.clearbit.com/microsoft.com',
          price: 383.28,
          marketCap: 2900000000000,
          volume: 22000000,
          mockPrice: 383.28,
          isUSStock: true,
          priceHistory: [],
          volume24h: 0,
        },
        balance: 5.25,
        value: 2012.22,
        change24h: 2.5,
      },
      {
        stock: {
          tokenId: 'TSLA',
          name: 'Tesla, Inc.',
          symbol: 'TSLA',
          description: 'Tesla, Inc. designs, develops, manufactures, leases, and sells electric vehicles, and energy generation and storage systems.',
          sector: 'Automotive',
          country: 'United States',
          market: 'NASDAQ',
          logo: 'https://logo.clearbit.com/tesla.com',
          price: 216.42,
          marketCap: 687000000000,
          volume: 94000000,
          mockPrice: 216.42,
          isUSStock: true,
          priceHistory: [],
          volume24h: 0,
        },
        balance: 8.0,
        value: 1731.36,
        change24h: -0.8,
      },
      {
        stock: {
          tokenId: 'SAFCOM',
          name: 'Safaricom Plc',
          symbol: 'SAFCOM',
          description: 'Safaricom PLC is a mobile network operator headquartered in Kenya. It is the largest telecommunications provider in Kenya.',
          sector: 'Telecommunications',
          country: 'Kenya',
          market: 'NSE',
          logo: 'https://logo.clearbit.com/safaricom.co.ke',
          price: 25.75,
          marketCap: 1032000000,
          volume: 1500000,
          mockPrice: 25.75,
          isUSStock: false,
          priceHistory: [],
          volume24h: 0,
        },
        balance: 100.0,
        value: 2575.0,
        change24h: 1.7,
      }
    ];
  };

  useEffect(() => {
    const fetchPortfolio = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        setError(null);

        // Use demo data for MVP if demo mode is enabled
        if (demoMode) {
          // Simulate a network delay for realism
          await new Promise(resolve => setTimeout(resolve, 1000));
          setPortfolio(generateDemoPortfolio());
          setIsLoading(false);
          return;
        }

        // Real implementation when not in demo mode
        // Fetch all stocks
        const stocksResponse = await fetch('/api/stocks');
        if (!stocksResponse.ok) {
          throw new Error('Failed to fetch stocks data from API');
        }
        const stocks = await stocksResponse.json();

        try {
          // Fetch balances and calculate values
          const portfolioItems = await Promise.all(
            stocks.map(async (stock: Stock) => {
              try {
                const balance = await hederaService.getTokenBalance(stock.tokenId);
                const priceData = priceService.getPrice(stock.tokenId);
                
                return {
                  stock,
                  balance,
                  value: balance * (priceData?.price || stock.mockPrice),
                  change24h: priceData?.change24h || 0,
                };
              } catch (itemError) {
                console.warn(`Error fetching data for ${stock.tokenId}:`, itemError);
                // Return with zero balance to filter out later if there's an error
                return {
                  stock,
                  balance: 0,
                  value: 0,
                  change24h: 0,
                };
              }
            })
          );

          // Filter out stocks with zero balance
          const nonZeroPortfolio = portfolioItems.filter(item => item.balance > 0);
          setPortfolio(nonZeroPortfolio);
        } catch (error) {
          console.error('Failed to fetch portfolio items:', error);
          // If we have stocks but failed to get balances, fall back to demo data
          setPortfolio(generateDemoPortfolio());
        }
      } catch (error) {
        console.error('Failed to fetch portfolio:', error);
        setError('Failed to load portfolio data. Using demo data instead.');
        // Fallback to demo data even in case of errors
        setPortfolio(generateDemoPortfolio());
      } finally {
        setIsLoading(false);
      }
    };

    fetchPortfolio();
  }, [user, demoMode]);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-16 bg-white rounded-lg shadow-lg">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 text-gray-400 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1 18a1 1 0 0 0 1 1h18a1.9 1.9 0 0 0 2-2V9.5c0-2.35-1.8-2.4-2-2h-9V3scalex(0, 1)-9 0V8c-.2 0-1.63.05-2 2v7a1.9 1.9 0 0 0 1 2z"/>
          <path d="M18 12a2 2 0 1 1 0-4v4a2 2 0 1 1 0 4v-4z"/>
        </svg>
        <p className="text-gray-600 mb-6">Please connect your wallet to view your portfolio</p>
        <div className="space-y-3 w-full max-w-xs">
          <a 
            href="/connect" 
            className="block w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-center"
          >
            Connect HashPack Wallet
          </a>
          
          <button 
            onClick={() => {
              // For demo purposes, directly simulate a user connection
              useAuthStore.getState().setUser({
                accountId: '0.0.1234567',
                publicKey: 'demo-key'
              });
            }}
            className="block w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-center text-sm"
          >
            Demo Mode (No Wallet Required)
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center py-16 bg-white rounded-lg shadow-lg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Loading your portfolio...</p>
      </div>
    );
  }

  // Show portfolio with demo banner if error occurred
  const showDemoBanner = error !== null || demoMode;

  return (
    <div className="space-y-6">
      {showDemoBanner && (
        <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4 text-sm text-yellow-800">
          <div className="flex">
            <svg className="h-5 w-5 text-yellow-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <p>
              Demo Mode: Displaying sample portfolio data for demonstration purposes.
              {error && <span className="block mt-1 font-medium">{error}</span>}
            </p>
          </div>
        </div>
      )}
      
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h2 className="text-2xl font-bold mb-4">Portfolio Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Total Value</p>
            <p className="text-3xl font-bold">${portfolio.reduce((sum, item) => sum + item.value, 0).toFixed(2)}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">24h Change</p>
            {(() => {
              const totalValue = portfolio.reduce((sum, item) => sum + item.value, 0);
              const totalChange = portfolio.reduce((sum, item) => sum + (item.value * item.change24h / 100), 0);
              const totalChangePercentage = totalValue > 0 ? (totalChange / totalValue) * 100 : 0;
              
              return (
                <p className={`text-3xl font-bold ${
                  totalChangePercentage >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {totalChangePercentage >= 0 ? '+' : ''}{totalChangePercentage.toFixed(2)}%
                </p>
              );
            })()}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6">Your Holdings</h2>
          <div className="space-y-4">
            {portfolio.map((item) => (
              <a
                key={item.stock.tokenId}
                href={`/stock/${item.stock.tokenId}`}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:shadow-md transition"
              >
                <div className="flex items-center space-x-4">
                  <div className="relative w-12 h-12 flex-shrink-0">
                    <img
                      src={item.stock.logo || '/images/stocks/default.png'}
                      alt={`${item.stock.name} logo`}
                      className="rounded-full object-cover w-full h-full shadow-sm border border-gray-200"
                      onError={(e) => {
                        e.currentTarget.src = '/images/stocks/default.png';
                      }}
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{item.stock.name}</h3>
                    <p className="text-sm text-gray-600">{item.stock.symbol}</p>
                  </div>
                </div>
                <div className="ml-auto text-right">
                  <p className="font-semibold text-gray-900">${item.value.toFixed(2)}</p>
                  <div className="flex items-center justify-end">
                    <p className="text-sm text-gray-600 mr-2">{item.balance.toFixed(6)} shares</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      item.change24h >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {item.change24h >= 0 ? '+' : ''}{item.change24h.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="text-right">
        <button
          onClick={() => setDemoMode(!demoMode)}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          {demoMode ? 'Try to load real data' : 'Switch to demo data'}
        </button>
      </div>
    </div>
  );
} 