'use client';

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/auth';
import { HederaService } from '../../services/hedera';
import { PriceService } from '../../services/price';
import { Stock } from '../../types/stock';

interface PortfolioItem {
  stock: Stock;
  balance: number;
  value: number;
  change24h: number;
}

export function PortfolioView() {
  const { user } = useAuthStore();
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const hederaService = HederaService.getInstance();
  const priceService = PriceService.getInstance();

  useEffect(() => {
    const fetchPortfolio = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        setError(null);

        // Fetch all stocks
        const stocks = await fetch('/api/stocks').then(res => res.json());

        // Fetch balances and calculate values
        const portfolioItems = await Promise.all(
          stocks.map(async (stock: Stock) => {
            const balance = await hederaService.getTokenBalance(stock.tokenId);
            const priceData = priceService.getPrice(stock.tokenId);
            
            return {
              stock,
              balance,
              value: balance * (priceData?.price || stock.mockPrice),
              change24h: priceData?.change24h || 0,
            };
          })
        );

        // Filter out stocks with zero balance
        const nonZeroPortfolio = portfolioItems.filter(item => item.balance > 0);
        setPortfolio(nonZeroPortfolio);
      } catch (error) {
        console.error('Failed to fetch portfolio:', error);
        setError('Failed to load portfolio data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPortfolio();
  }, [user]);

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Please connect your wallet to view your portfolio</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (portfolio.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Your portfolio is empty</p>
      </div>
    );
  }

  const totalValue = portfolio.reduce((sum, item) => sum + item.value, 0);
  const totalChange = portfolio.reduce((sum, item) => sum + (item.value * item.change24h / 100), 0);
  const totalChangePercentage = (totalChange / totalValue) * 100;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Portfolio Summary</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Total Value</p>
            <p className="text-2xl font-bold">${totalValue.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">24h Change</p>
            <p className={`text-2xl font-bold ${
              totalChangePercentage >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {totalChangePercentage >= 0 ? '+' : ''}{totalChangePercentage.toFixed(2)}%
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">Holdings</h2>
          <div className="space-y-4">
            {portfolio.map((item) => (
              <div
                key={item.stock.tokenId}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <div className="relative w-12 h-12">
                    <img
                      src={item.stock.logo}
                      alt={`${item.stock.tokenId} logo`}
                      className="rounded-full"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{item.stock.name}</h3>
                    <p className="text-sm text-gray-600">{item.stock.tokenId}</p>
                  </div>
                </div>
                <div className="ml-auto text-right">
                  <p className="font-semibold text-gray-900">${item.value.toFixed(2)}</p>
                  <p className="text-sm text-gray-600">{item.balance} {item.stock.tokenId}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 