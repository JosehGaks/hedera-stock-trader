'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/app/store/auth';
import { Stock } from '@/app/types/stock';
import { mockStocks } from '@/app/data/mockStocks';

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/connect');
      return;
    }

    // In a real app, this would be an API call
    setStocks(mockStocks);
    setLoading(false);
  }, [user, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <div className="text-gray-400">
            Connected Account: {user?.accountId}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stocks.map((stock) => (
            <div
              key={stock.tokenId}
              className="bg-gray-800 rounded-lg p-4 cursor-pointer hover:bg-gray-700 transition-colors"
              onClick={() => router.push(`/stock/${stock.tokenId}`)}
            >
              <div className="flex items-center space-x-4">
                <div className="relative w-12 h-12">
                  <img
                    src={stock.logo}
                    alt={`${stock.tokenId} logo`}
                    className="rounded-full"
                  />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">{stock.tokenId}</h2>
                  <p className="text-gray-400">{stock.name}</p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-gray-400">
                  Price: <span className="text-white">${stock.mockPrice.toFixed(2)}</span>
                </p>
                <p className="text-gray-400">
                  Market Cap: <span className="text-white">${stock.marketCap.toLocaleString()}</span>
                </p>
                <p className="text-gray-400">
                  24h Volume: <span className="text-white">${stock.volume24h.toLocaleString()}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 