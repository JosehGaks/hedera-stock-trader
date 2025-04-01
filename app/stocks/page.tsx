'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useStockStore } from '../store/stock';
import { Stock } from '../types/stock';

export default function StocksPage() {
  const { stocks, fetchStocks, isLoading, error } = useStockStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMarket, setSelectedMarket] = useState('all');
  const [selectedSector, setSelectedSector] = useState('all');

  useEffect(() => {
    fetchStocks();
  }, [fetchStocks]);

  // Apply filters to stocks
  const filteredStocks = stocks.filter((stock: Stock) => {
    // Market filter
    if (selectedMarket === 'us' && !stock.isUSStock) return false;
    if (selectedMarket === 'africa' && stock.isUSStock) return false;
    
    // Sector filter
    if (selectedSector !== 'all' && stock.sector !== selectedSector) return false;
    
    // Search filter
    if (searchTerm && !stock.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !stock.symbol.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    return true;
  });
  
  // Get unique sectors for filter dropdown
  const sectors = Array.from(new Set(stocks.map((stock: Stock) => stock.sector))).sort();

  return (
    <div className="pt-20 pb-12 px-4 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Stock Explorer</h1>
        <p className="text-gray-600">Discover and trade stocks on the Hedera network</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Search */}
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                id="search"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search by name or symbol"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Market filter */}
          <div>
            <label htmlFor="market" className="block text-sm font-medium text-gray-700 mb-1">
              Market
            </label>
            <select
              id="market"
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              value={selectedMarket}
              onChange={(e) => setSelectedMarket(e.target.value)}
            >
              <option value="all">All Markets</option>
              <option value="us">US Markets</option>
              <option value="africa">African Markets</option>
            </select>
          </div>

          {/* Sector filter */}
          <div>
            <label htmlFor="sector" className="block text-sm font-medium text-gray-700 mb-1">
              Sector
            </label>
            <select
              id="sector"
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
            >
              <option value="all">All Sectors</option>
              {sectors.map((sector) => (
                <option key={sector} value={sector}>{sector}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stocks Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="text-center py-12 bg-red-50 rounded-lg">
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchStocks}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      ) : filteredStocks.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No stocks match your filters. Try adjusting your search criteria.</p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedMarket('all');
              setSelectedSector('all');
            }}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStocks.map((stock: Stock) => (
            <Link
              key={stock.tokenId}
              href={`/stock/${stock.tokenId}`}
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition border border-gray-100 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 flex-shrink-0">
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
                      <h3 className="font-bold text-lg text-gray-900">{stock.name}</h3>
                      <p className="text-sm text-gray-600">{stock.symbol}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <p className="font-semibold text-lg">${stock.mockPrice.toFixed(2)}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      Math.random() > 0.5 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {Math.random() > 0.5 ? '+' : '-'}{(Math.random() * 5).toFixed(2)}%
                    </span>
                  </div>
                </div>
                
                <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                  <div className="p-2 bg-gray-50 rounded">
                    <p className="text-gray-500">Market</p>
                    <p className="font-medium text-gray-900">{stock.market}</p>
                  </div>
                  <div className="p-2 bg-gray-50 rounded">
                    <p className="text-gray-500">Sector</p>
                    <p className="font-medium text-gray-900">{stock.sector}</p>
                  </div>
                </div>
                
                <div className="mt-4 flex justify-between items-center">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    stock.isUSStock ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'
                  }`}>
                    {stock.isUSStock ? 'US Market' : 'African Market'}
                  </span>
                  <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                    View Details →
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
} 