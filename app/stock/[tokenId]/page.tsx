'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useStockStore } from '../../store/stock';
import { useAuthStore } from '../../store/auth';
import { PriceChart } from '../../components/stock/PriceChart';
import { TradePanel } from '../../components/stock/TradePanel';
import { AlphaVantageService } from '../../services/AlphaVantageService';
import { DataTransformService } from '../../services/DataTransformService';

export default function StockDetails() {
  const { tokenId } = useParams();
  const { user } = useAuthStore();
  const { selectedStock, loading, error, fetchStock } = useStockStore();
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchStockData = async () => {
    if (!tokenId) return;

    try {
      setIsLoading(true);
      setFetchError(null);

      const quoteData = await AlphaVantageService.getInstance().getStockQuote(tokenId as string);
      if (!quoteData) {
        throw new Error('Failed to fetch stock quote');
      }
      const transformedData = await DataTransformService.getInstance().transformStockQuote(tokenId as string, quoteData);
      setStockData(transformedData);
      fetchStock(tokenId);
    } catch (e) {
      setFetchError(e instanceof Error ? e.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStockData();

    // Set up interval for real-time updates
    const interval = setInterval(() => {
      if (stockData?.tokenId) {
        fetchStockData();
      }
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [tokenId, fetchStock]);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading stock details...</p>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{fetchError}</p>
      </div>
    );
  }

  if (!selectedStock) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Stock not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stock Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center space-x-4">
          <div className="relative w-16 h-16">
            <img
              src={selectedStock.logo}
              alt={`${selectedStock.name} logo`}
              className="rounded-full"
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{selectedStock.name}</h1>
            <p className="text-lg text-gray-600">${selectedStock.symbol}</p>
          </div>
          <div className="ml-auto">
            <div className="text-3xl font-bold text-gray-900">
              ${selectedStock.mockPrice.toFixed(2)}
            </div>
            <p className="text-sm text-gray-500 text-right">USD</p>
          </div>
        </div>
      </div>

      {/* Stock Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Price Chart */}
        <div className="lg:col-span-2 bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Price History</h2>
          <PriceChart priceHistory={selectedStock.priceHistory} />
        </div>

        {/* Trading Panel */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Trade</h2>
          {user ? (
            <TradePanel stock={selectedStock} />
          ) : (
            <p className="text-gray-600">Connect your wallet to start trading</p>
          )}
        </div>

        {/* Stock Information */}
        <div className="lg:col-span-3 bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">About {selectedStock.name}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Country</h3>
              <p className="mt-1 text-lg text-gray-900">{selectedStock.country}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Sector</h3>
              <p className="mt-1 text-lg text-gray-900">{selectedStock.sector}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Token ID</h3>
              <p className="mt-1 text-lg text-gray-900">{selectedStock.tokenId}</p>
            </div>
          </div>
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-500">Description</h3>
            <p className="mt-1 text-gray-900">{selectedStock.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
} 