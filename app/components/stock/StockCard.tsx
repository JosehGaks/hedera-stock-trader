'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Stock } from '../../types/stock';
import { PriceService } from '../../services/price';

interface PriceData {
  price: number;
  change24h: number;
}

interface StockCardProps {
  stock: Stock;
}

export function StockCard({ stock }: StockCardProps) {
  const router = useRouter();
  const [priceData, setPriceData] = useState<PriceData | null>(null);
  const priceService = PriceService.getInstance();

  useEffect(() => {
    const updatePrice = () => {
      const price = priceService.getPrice(stock.tokenId);
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
  }, [stock.tokenId]);

  const handleClick = () => {
    router.push(`/stocks/${stock.tokenId}`);
  };

  const currentPrice = priceData?.price || stock.mockPrice;
  const priceChange = priceData?.change24h || 0;

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-md transition-shadow"
    >
      <div className="flex items-center space-x-4 mb-4">
        <div className="relative w-12 h-12">
          <img
            src={stock.logo}
            alt={`${stock.tokenId} logo`}
            className="rounded-full"
          />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">{stock.name}</h3>
          <span className="text-gray-600">{stock.tokenId}</span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Price</span>
          <div className="text-right">
            <span className="font-medium">${currentPrice.toFixed(2)}</span>
            <span className={`ml-2 text-sm ${
              priceChange >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
            </span>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-600">Market Cap</span>
          <span className="font-medium">
            ${(stock.marketCap / 1000000000).toFixed(2)}B
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-600">24h Volume</span>
          <span className="font-medium">
            ${(stock.volume24h / 1000000).toFixed(2)}M
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-600">Sector</span>
          <span className="font-medium">{stock.sector}</span>
        </div>
      </div>
    </div>
  );
} 