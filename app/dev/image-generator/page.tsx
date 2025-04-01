'use client';

import React from 'react';
import DefaultImageCreator from '../../components/development/DefaultImageCreator';
import { mockStocks } from '../../data/mockStocks';

export default function ImageGeneratorPage() {
  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">Stock Image Generator</h1>
      <p className="mb-8 text-gray-700">
        This utility helps generate stock icons for the demo. Download each image and save it to the
        <code className="mx-1 px-2 py-1 bg-gray-100 rounded">/public/images/stocks/</code>
        directory.
      </p>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Default Fallback Image</h2>
        <DefaultImageCreator 
          symbol="ST" 
          backgroundColor="#64748b" 
        />
        <p className="mt-2 text-sm text-gray-600">
          This is the fallback image used when a stock logo is not available.
          Save this as <code className="px-1 bg-gray-100 rounded">default.png</code>.
        </p>
      </div>
      
      <h2 className="text-xl font-semibold mb-4">Stock-Specific Images</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockStocks.map((stock) => (
          <div key={stock.symbol} className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold mb-2">{stock.name}</h3>
            <p className="text-sm text-gray-600 mb-4">Symbol: {stock.symbol}</p>
            <DefaultImageCreator 
              symbol={stock.symbol.substring(0, 2)} 
              backgroundColor={getRandomColor(stock.symbol)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// Helper function to generate deterministic colors based on symbol
function getRandomColor(symbol: string): string {
  // Create a simple hash of the symbol
  const hash = symbol.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  
  // Convert to HSL for better colors (avoid too light/dark)
  const h = Math.abs(hash % 360);
  const s = 65 + (hash % 20); // 65-85%
  const l = 45 + (hash % 15); // 45-60%
  
  return `hsl(${h}, ${s}%, ${l}%)`;
} 