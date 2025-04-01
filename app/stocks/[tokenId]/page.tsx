'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useStockStore } from '../../store/stock';
import { Stock } from '../../types/stock';
import { TradePanel } from '../../components/stock/TradePanel';
import { PriceChart } from '../../components/stock/PriceChart';
import { PriceService } from '../../services/price';

export default function StockDetailsPage() {
  const params = useParams();
  const tokenId = params.tokenId as string;
  const { selectedStock, fetchStock, isLoading, error } = useStockStore();
  const [priceData, setPriceData] = useState<{ price: number; change24h: number } | null>(null);
  const priceService = PriceService.getInstance();

  useEffect(() => {
    fetchStock(tokenId);
  }, [tokenId, fetchStock]);

  useEffect(() => {
    const updatePrice = () => {
      const price = priceService.getPrice(tokenId);
      if (price) {
        setPriceData({
          price: price.price,
          change24h: price.change24h,
        });
      }
    };

    // Initial price update
    updatePrice();

    // Subscribe to price updates
    const interval = setInterval(updatePrice, 30000); // Update every 30 seconds

    return () => {
      clearInterval(interval);
    };
  }, [tokenId]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error || !selectedStock) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-8">
          <p className="text-red-600">{error || 'Stock not found'}</p>
        </div>
      </div>
    );
  }

  const currentPrice = priceData?.price || selectedStock.mockPrice;
  const priceChange = priceData?.change24h || 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Stock Information */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center space-x-4 mb-6">
              <img
                src={selectedStock.logo}
                alt={selectedStock.name}
                className="w-16 h-16 rounded-full"
              />
              <div>
                <h1 className="text-2xl font-bold">{selectedStock.name}</h1>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-600">{selectedStock.symbol}</span>
                  <span className="text-sm text-gray-500">{selectedStock.market}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">Price</p>
                <div className="flex items-center">
                  <span className="text-xl font-bold">${currentPrice.toFixed(2)}</span>
                  <span className={`ml-2 text-sm ${
                    priceChange >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600">Market Cap</p>
                <p className="text-xl font-bold">
                  ${(selectedStock.marketCap / 1000000000).toFixed(2)}B
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">24h Volume</p>
                <p className="text-xl font-bold">
                  ${(selectedStock.volume24h / 1000000).toFixed(2)}M
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Sector</p>
                <p className="text-xl font-bold">{selectedStock.sector}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">About</h2>
            <p className="text-gray-600">{selectedStock.description}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Price History</h2>
            <PriceChart
              symbol={selectedStock.symbol}
              isUSStock={selectedStock.isUSStock}
            />
          </div>
        </div>

        {/* Trading Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow">
            <TradePanel stock={selectedStock} />
          </div>
        </div>
      </div>
    </div>
  );
} 