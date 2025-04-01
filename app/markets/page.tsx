'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface MarketData {
  name: string;
  index: string;
  value: number;
  change: number;
  volume: string;
  status: 'open' | 'closed';
  lastUpdated: string;
}

export default function MarketsPage() {
  const [markets, setMarkets] = useState<MarketData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Simulate loading market data
    const loadMarketData = async () => {
      setIsLoading(true);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock market data
      const mockMarkets: MarketData[] = [
        {
          name: 'New York Stock Exchange',
          index: 'NYSE',
          value: 16482.42,
          change: 0.78,
          volume: '3.5B',
          status: 'open',
          lastUpdated: new Date().toISOString()
        },
        {
          name: 'NASDAQ',
          index: 'NASDAQ',
          value: 14278.91,
          change: 1.24,
          volume: '4.2B',
          status: 'open',
          lastUpdated: new Date().toISOString()
        },
        {
          name: 'Johannesburg Stock Exchange',
          index: 'JSE',
          value: 68432.18,
          change: -0.35,
          volume: '1.2B',
          status: 'closed',
          lastUpdated: new Date().toISOString()
        },
        {
          name: 'Nigerian Exchange Group',
          index: 'NGX',
          value: 67354.25,
          change: 1.05,
          volume: '450M',
          status: 'closed',
          lastUpdated: new Date().toISOString()
        },
        {
          name: 'Nairobi Securities Exchange',
          index: 'NSE',
          value: 1854.73,
          change: -0.12,
          volume: '120M',
          status: 'closed',
          lastUpdated: new Date().toISOString()
        },
        {
          name: 'Egyptian Exchange',
          index: 'EGX',
          value: 24563.18,
          change: 0.65,
          volume: '210M',
          status: 'closed',
          lastUpdated: new Date().toISOString()
        }
      ];
      
      setMarkets(mockMarkets);
      setIsLoading(false);
    };
    
    loadMarketData();
  }, []);

  // Group markets by continent
  const usMarkets = markets.filter(market => ['NYSE', 'NASDAQ'].includes(market.index));
  const africanMarkets = markets.filter(market => !['NYSE', 'NASDAQ'].includes(market.index));
  
  return (
    <div className="pt-20 pb-12 px-4 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Global Markets</h1>
        <p className="text-gray-600">Real-time market data from US and African exchanges</p>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="space-y-12">
          {/* Market summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl text-white p-8 shadow-lg">
              <h2 className="text-xl font-bold mb-2">US Markets</h2>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-3xl font-bold">{usMarkets[0].value.toFixed(2)}</p>
                  <p className="text-sm text-blue-200">{usMarkets[0].index}</p>
                </div>
                <div className={`text-right ${usMarkets[0].change >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                  <p className="text-lg font-bold">{usMarkets[0].change >= 0 ? '+' : ''}{usMarkets[0].change}%</p>
                  <p className="text-sm">Today</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl text-white p-8 shadow-lg">
              <h2 className="text-xl font-bold mb-2">African Markets</h2>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-3xl font-bold">{africanMarkets[0].value.toFixed(2)}</p>
                  <p className="text-sm text-purple-200">{africanMarkets[0].index}</p>
                </div>
                <div className={`text-right ${africanMarkets[0].change >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                  <p className="text-lg font-bold">{africanMarkets[0].change >= 0 ? '+' : ''}{africanMarkets[0].change}%</p>
                  <p className="text-sm">Today</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* US Markets Section */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">US Markets</h2>
              <Link href="/stocks?market=us" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                View US Stocks →
              </Link>
            </div>
            
            <div className="bg-white shadow-md rounded-xl overflow-hidden border border-gray-100">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Market</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Index</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Change</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Volume</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {usMarkets.map((market) => (
                      <tr key={market.index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{market.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-gray-900">{market.index}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="text-sm font-medium text-gray-900">{market.value.toFixed(2)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className={`text-sm font-medium ${market.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {market.change >= 0 ? '+' : ''}{market.change}%
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="text-sm text-gray-600">{market.volume}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            market.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {market.status === 'open' ? 'Open' : 'Closed'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          
          {/* African Markets Section */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">African Markets</h2>
              <Link href="/stocks?market=africa" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                View African Stocks →
              </Link>
            </div>
            
            <div className="bg-white shadow-md rounded-xl overflow-hidden border border-gray-100">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Market</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Index</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Change</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Volume</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {africanMarkets.map((market) => (
                      <tr key={market.index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{market.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-gray-900">{market.index}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="text-sm font-medium text-gray-900">{market.value.toFixed(2)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className={`text-sm font-medium ${market.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {market.change >= 0 ? '+' : ''}{market.change}%
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="text-sm text-gray-600">{market.volume}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            market.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {market.status === 'open' ? 'Open' : 'Closed'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          
          {/* Trading Opportunities Section */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8 border border-blue-100">
            <h2 className="text-2xl font-bold mb-4">Trading Opportunities</h2>
            <p className="text-gray-600 mb-6">
              Hedera Stock Trader offers unique opportunities to diversify your portfolio with both US and African markets.
              Our platform enables easy cross-market trading with the security and transparency of the Hedera network.
            </p>
            
            <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
              <Link href="/stocks" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-center">
                Explore All Markets
              </Link>
              <Link href="/connect" className="inline-block px-6 py-3 bg-white text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 text-center">
                Connect Wallet to Trade
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 