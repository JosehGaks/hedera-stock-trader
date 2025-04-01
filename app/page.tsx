'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from './store/auth';
import { useStockStore } from './store/stock';
import { Stock } from './types/stock';

export default function HomePage() {
  const { user } = useAuthStore();
  const { stocks, fetchStocks } = useStockStore();
  const [featuredStocks, setFeaturedStocks] = useState<Stock[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      await fetchStocks();
      setIsLoading(false);
    };
    initialize();
  }, [fetchStocks]);

  useEffect(() => {
    if (stocks.length > 0) {
      // Select a mix of US and African stocks for the featured section
      const usStocks = stocks.filter(stock => stock.isUSStock).slice(0, 3);
      const africanStocks = stocks.filter(stock => !stock.isUSStock).slice(0, 2);
      setFeaturedStocks([...usStocks, ...africanStocks]);
    }
  }, [stocks]);

  return (
    <div className="bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <section className="pt-28 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Trade Stocks on the <span className="text-blue-600">Hedera</span> Network
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto">
            The first decentralized stock trading platform powered by Hedera's secure, fast, and eco-friendly DLT.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link href="/stocks">
              <button className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg transition">
                Explore Stocks
              </button>
            </Link>
            {!user ? (
              <Link href="/connect">
                <button className="px-8 py-4 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg shadow-lg transition">
                  Connect Wallet
                </button>
              </Link>
            ) : (
              <Link href="/portfolio">
                <button className="px-8 py-4 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg shadow-lg transition">
                  View Portfolio
                </button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Featured Stocks */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Featured Stocks</h2>
            <Link href="/stocks" className="text-blue-600 hover:text-blue-800 font-medium">
              View All Stocks →
            </Link>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {featuredStocks.map((stock) => (
                <Link
                  key={stock.tokenId}
                  href={`/stock/${stock.tokenId}`}
                  className="bg-gray-50 rounded-xl hover:shadow-md transition border border-gray-100 overflow-hidden"
                >
                  <div className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 flex-shrink-0">
                        <img
                          src={stock.logo || '/images/stocks/default.png'}
                          alt={stock.name}
                          className="w-full h-full object-cover rounded-full shadow-sm border border-gray-200"
                          onError={(e) => {
                            e.currentTarget.src = '/images/stocks/default.png';
                          }}
                        />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{stock.symbol}</h3>
                        <p className="text-xs text-gray-500 truncate">{stock.name}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex justify-between items-center">
                      <p className="font-semibold">${stock.mockPrice.toFixed(2)}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        Math.random() > 0.5 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {Math.random() > 0.5 ? '+' : '-'}{(Math.random() * 5).toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-16">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-md text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 18a1 1 0 0 0 1 1h18a1.9 1.9 0 0 0 2-2V9.5c0-2.35-1.8-2.4-2-2h-9V3scalex(0, 1)-9 0V8c-.2 0-1.63.05-2 2v7a1.9 1.9 0 0 0 1 2z"/>
                  <path d="M18 12a2 2 0 1 1 0-4v4a2 2 0 1 1 0 4v-4z"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">1. Connect Wallet</h3>
              <p className="text-gray-600">Connect your HashPack wallet to access the Hedera network and start trading.</p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-md text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">2. Explore Markets</h3>
              <p className="text-gray-600">Browse stocks from US and African markets, analyze trends, and make informed decisions.</p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-md text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">3. Trade Securely</h3>
              <p className="text-gray-600">Buy and sell stocks with the security and transparency of Hedera's distributed ledger.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Mode CTA */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-xl overflow-hidden">
          <div className="p-8 md:p-12">
            <h2 className="text-3xl font-bold text-white mb-4">Try Demo Mode</h2>
            <p className="text-blue-100 text-lg mb-8">
              Not ready to connect your wallet? No problem! Try our demo mode to explore the platform without any commitment.
            </p>
            <Link href="/stocks">
              <button 
                onClick={() => {
                  // For demo purposes, directly simulate a user connection
                  if (!user) {
                    useAuthStore.getState().setUser({
                      accountId: '0.0.1234567',
                      publicKey: 'demo-key'
                    });
                  }
                }}
                className="px-8 py-4 bg-white text-blue-600 font-bold rounded-lg shadow-lg hover:bg-blue-50 transition"
              >
                Start Demo Now
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
