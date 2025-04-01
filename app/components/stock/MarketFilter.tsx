'use client';

import React from 'react';

interface MarketFilterProps {
  selectedMarket: string;
  onMarketChange: (market: string) => void;
}

export function MarketFilter({ selectedMarket, onMarketChange }: MarketFilterProps) {
  const markets = [
    { id: 'all', name: 'All Markets' },
    { id: 'us', name: 'US Markets' },
    { id: 'africa', name: 'African Markets' },
  ];

  return (
    <div className="flex space-x-4 mb-6">
      {markets.map((market) => (
        <button
          key={market.id}
          onClick={() => onMarketChange(market.id)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            selectedMarket === market.id
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {market.name}
        </button>
      ))}
    </div>
  );
} 