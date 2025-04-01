'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useStockStore } from '../../store/stock';
import { useAuthStore } from '../../store/auth';
import { PriceChart } from '../../components/stock/PriceChart';
import { TradePanel } from '../../components/stock/TradePanel';
import { AlphaVantageService } from '../../services/alphaVantage';
import { DataTransformService } from '../../services/dataTransform';
import { StockData, Stock } from '../../types/stock';
import { TokenizationService } from '../../services/tokenization';
import Notification from '../../components/ui/Notification';

export default function StockDetails() {
  const params = useParams();
  const tokenId = params.tokenId as string;
  const { user } = useAuthStore();
  const { selectedStock, error, fetchStock } = useStockStore();
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [availableStocks, setAvailableStocks] = useState<Stock[]>([]);
  const [chartTimeRange, setChartTimeRange] = useState('1D');
  const [userOwnsStock, setUserOwnsStock] = useState(false);
  const [userBalance, setUserBalance] = useState(0);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');

  const fetchStockData = async () => {
    if (!tokenId) return;

    try {
      setIsLoading(true);
      setFetchError(null);

      // Fetch stock from API to get the symbol
      const response = await fetch('/api/stocks');
      if (!response.ok) {
        throw new Error('Failed to fetch stock data');
      }
      
      const stocks = await response.json();
      console.log('Available stocks:', stocks);
      console.log('Looking for tokenId:', tokenId);
      setAvailableStocks(stocks);
      
      const stock = stocks.find((s: any) => s.tokenId === tokenId);
      
      if (!stock) {
        console.error(`Stock with tokenId ${tokenId} not found in available stocks`);
        throw new Error(`Stock with ID ${tokenId} not found`);
      }

      console.log('Found stock:', stock);

      // Use the symbol to fetch quote data from Alpha Vantage
      const quoteData = await AlphaVantageService.getInstance().getStockQuote(stock.symbol);
      if (!quoteData) {
        throw new Error('Failed to fetch stock quote');
      }
      
      const transformedData = await DataTransformService.getInstance().transformStockQuote(stock.symbol, quoteData);
      setStockData(transformedData);
      fetchStock(tokenId);
    } catch (e) {
      console.error('Error fetching stock data:', e);
      setFetchError(e instanceof Error ? e.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Check if user owns this stock
  useEffect(() => {
    const checkUserHoldings = async () => {
      if (user && selectedStock) {
        try {
          // For demo purposes, we'll simulate checking the balance
          const demoMode = true;
          
          if (demoMode) {
            // 50% chance the user already owns some shares for demo purposes
            const randomOwned = Math.random() > 0.5;
            if (randomOwned) {
              const randomBalance = Number((Math.random() * 10).toFixed(6));
              setUserBalance(randomBalance);
              setUserOwnsStock(true);
            }
            return;
          }
          
          // Real implementation
          const balance = await TokenizationService.getInstance().getTokenBalance(selectedStock.tokenId);
          setUserBalance(balance);
          setUserOwnsStock(balance > 0);
        } catch (error) {
          console.error('Error checking user holdings:', error);
        }
      }
    };
    
    checkUserHoldings();
  }, [user, selectedStock]);

  useEffect(() => {
    fetchStockData();

    // Set up interval for real-time updates
    const interval = setInterval(() => {
      if (stockData?.tokenId) {
        fetchStockData();
      }
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [tokenId]);

  const handleTradeComplete = () => {
    fetchStockData();
    setShowNotification(true);
    setNotificationMessage('Trade completed successfully! Your portfolio has been updated.');
    
    // Update user holdings for demo
    setUserOwnsStock(true);
    setUserBalance(prev => prev + Math.random() * 2); // Just add some random amount for demo
  };

  if (isLoading) {
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
        <div className="mt-4">
          <button 
            onClick={fetchStockData} 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mr-4"
          >
            Try Again
          </button>
          <a 
            href="/stocks" 
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            View All Stocks
          </a>
        </div>
        
        {availableStocks.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-700 mb-4">Available Stocks:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableStocks.map((stock) => (
                <a 
                  key={stock.tokenId} 
                  href={`/stock/${stock.tokenId}`}
                  className="block p-4 bg-white rounded shadow hover:shadow-md transition"
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 mr-3">
                      <img 
                        src={stock.logo || '/images/stocks/default.png'} 
                        alt={stock.name} 
                        className="w-full h-full object-cover rounded-full"
                      />
                    </div>
                    <div>
                      <p className="font-medium">{stock.name}</p>
                      <p className="text-sm text-gray-500">{stock.symbol}</p>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (!selectedStock) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Stock not found</p>
        <a 
          href="/stocks" 
          className="mt-4 inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          View All Stocks
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Stock Header */}
      <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center">
          <div className="flex items-center space-x-4">
            <div className="relative w-16 h-16 flex-shrink-0">
              <img
                src={selectedStock.logo || '/images/stocks/default.png'}
                alt={`${selectedStock.name} logo`}
                className="rounded-full object-cover w-full h-full shadow-md border-2 border-white"
                onError={(e) => {
                  e.currentTarget.src = '/images/stocks/default.png';
                }}
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{selectedStock.name}</h1>
              <div className="flex items-center">
                <p className="text-lg text-gray-600">{selectedStock.symbol}</p>
                <span className="mx-2 text-gray-400">•</span>
                <span className={`px-2 py-1 text-xs rounded-full ${selectedStock.isUSStock ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'}`}>
                  {selectedStock.isUSStock ? 'US Market' : 'African Market'}
                </span>
              </div>
            </div>
          </div>
          <div className="mt-4 md:mt-0 md:ml-auto">
            <div className="text-3xl font-bold text-gray-900">
              ${(stockData?.price || selectedStock.mockPrice).toFixed(2)}
            </div>
            <div className="flex items-center">
              <p className={`text-sm font-semibold ${stockData?.changePercent && stockData.changePercent > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stockData?.changePercent ? `${stockData.changePercent > 0 ? '+' : ''}${stockData.changePercent.toFixed(2)}%` : '0.00%'}
              </p>
              <span className="mx-1 text-gray-400">|</span>
              <p className="text-xs text-gray-500">
                Updated {new Date().toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>
        
        {userOwnsStock && user && (
          <div className="mt-4 flex items-center">
            <div className="mr-3 bg-blue-50 rounded-lg px-3 py-1">
              <span className="text-sm text-blue-700">You own: <span className="font-bold">{userBalance.toFixed(6)}</span> shares</span>
            </div>
            <button 
              onClick={() => {
                // Scroll to trade panel
                document.querySelector('#trade-panel')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-sm bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition"
            >
              Buy More
            </button>
          </div>
        )}
      </div>

      {/* Market Overview Banner */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">Market Overview</h2>
            <p className="mt-1 text-white/80">Trading on the {selectedStock.isUSStock ? 'US' : 'African'} market</p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-4">
            <div className="text-center">
              <p className="text-sm text-white/80">Market Cap</p>
              <p className="text-lg font-bold">${((stockData?.marketCap || selectedStock.marketCap || 0) / 1000000).toFixed(1)}M</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-white/80">Volume</p>
              <p className="text-lg font-bold">${((stockData?.volume || 0) / 1000).toFixed(1)}K</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-white/80">Sector</p>
              <p className="text-lg font-bold">{selectedStock.sector}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stock Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Price Chart */}
        <div className="lg:col-span-2 bg-white shadow-lg rounded-xl p-6 border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Price History</h2>
            <div className="flex space-x-2">
              <button 
                onClick={() => setChartTimeRange('1D')} 
                className={`px-3 py-1 text-sm rounded-full ${chartTimeRange === '1D' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                1D
              </button>
              <button 
                onClick={() => setChartTimeRange('1W')} 
                className={`px-3 py-1 text-sm rounded-full ${chartTimeRange === '1W' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                1W
              </button>
              <button 
                onClick={() => setChartTimeRange('1M')} 
                className={`px-3 py-1 text-sm rounded-full ${chartTimeRange === '1M' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                1M
              </button>
              <button 
                onClick={() => setChartTimeRange('1Y')} 
                className={`px-3 py-1 text-sm rounded-full ${chartTimeRange === '1Y' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                1Y
              </button>
            </div>
          </div>
          <PriceChart tokenId={selectedStock.tokenId} isUSStock={selectedStock.isUSStock} timeRange={chartTimeRange} />
        </div>

        {/* Trading Panel */}
        <div id="trade-panel" className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
          <h2 className="text-xl font-semibold mb-4">Trade {selectedStock.symbol}</h2>
          {user ? (
            <TradePanel 
              stock={{
                tokenId: selectedStock.tokenId,
                name: selectedStock.name,
                price: stockData?.price || selectedStock.mockPrice,
                isUSStock: selectedStock.isUSStock
              }}
              onTradeComplete={handleTradeComplete}
            />
          ) : (
            <div className="p-6 bg-gray-50 rounded-lg text-center">
              <div className="mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 mx-auto mb-3 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 18a1 1 0 0 0 1 1h18a1.9 1.9 0 0 0 2-2V9.5c0-2.35-1.8-2.4-2-2h-9V3scalex(0, 1)-9 0V8c-.2 0-1.63.05-2 2v7a1.9 1.9 0 0 0 1 2z"/>
                  <path d="M18 12a2 2 0 1 1 0-4v4a2 2 0 1 1 0 4v-4z"/>
                </svg>
                <p className="text-gray-600 mb-4">Connect your HashPack wallet to start trading {selectedStock.name} shares</p>
              </div>
              
              <div className="space-y-3">
                <a 
                  href="/connect" 
                  className="block w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-center"
                >
                  Connect HashPack Wallet
                </a>
                
                <button 
                  onClick={() => {
                    // For demo purposes, directly simulate a user connection
                    useAuthStore.getState().setUser({
                      accountId: '0.0.1234567',
                      publicKey: 'demo-key'
                    });
                  }}
                  className="block w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-center text-sm"
                >
                  Demo Mode (No Wallet Required)
                </button>
              </div>
              
              <p className="mt-4 text-xs text-gray-500">
                Don't have HashPack? <a href="https://www.hashpack.app/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Get it here</a>
              </p>
            </div>
          )}
        </div>

        {/* Company Information */}
        <div className="lg:col-span-3 bg-white shadow-lg rounded-xl p-6 border border-gray-100">
          <h2 className="text-xl font-semibold mb-6">About {selectedStock.name}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="p-4 rounded-lg bg-gray-50">
              <h3 className="text-sm font-medium text-gray-500">Country</h3>
              <p className="mt-1 text-lg text-gray-900">{selectedStock.country}</p>
            </div>
            <div className="p-4 rounded-lg bg-gray-50">
              <h3 className="text-sm font-medium text-gray-500">Sector</h3>
              <p className="mt-1 text-lg text-gray-900">{selectedStock.sector}</p>
            </div>
            <div className="p-4 rounded-lg bg-gray-50">
              <h3 className="text-sm font-medium text-gray-500">Market</h3>
              <p className="mt-1 text-lg text-gray-900">{selectedStock.market}</p>
            </div>
          </div>
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Description</h3>
            <div className="p-4 rounded-lg bg-gray-50">
              <p className="text-gray-800 leading-relaxed">{selectedStock.description}</p>
            </div>
          </div>
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Token Details</h3>
            <div className="p-4 rounded-lg bg-gray-50">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm text-gray-500">Token ID</p>
                  <p className="font-mono text-sm">{selectedStock.tokenId}</p>
                </div>
                <div className="mt-2 md:mt-0">
                  <button 
                    onClick={() => { 
                      navigator.clipboard.writeText(selectedStock.tokenId);
                      alert('Token ID copied to clipboard');
                    }}
                    className="px-3 py-1 text-xs bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100"
                  >
                    Copy Token ID
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Similar Stocks Section */}
      <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
        <h2 className="text-xl font-semibold mb-6">Similar Stocks</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {availableStocks
            .filter(stock => stock.sector === selectedStock.sector && stock.tokenId !== selectedStock.tokenId)
            .slice(0, 4)
            .map((stock) => (
              <a 
                key={stock.tokenId} 
                href={`/stock/${stock.tokenId}`}
                className="block p-4 bg-gray-50 rounded-lg hover:shadow-md transition"
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 mr-3 flex-shrink-0">
                    <img 
                      src={stock.logo || '/images/stocks/default.png'} 
                      alt={stock.name} 
                      className="w-full h-full object-cover rounded-full"
                      onError={(e) => {
                        e.currentTarget.src = '/images/stocks/default.png';
                      }}
                    />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{stock.name}</p>
                    <p className="text-sm text-gray-500">{stock.symbol}</p>
                  </div>
                </div>
              </a>
            ))}
        </div>
      </div>

      {/* Success Notification */}
      {showNotification && (
        <Notification 
          message={notificationMessage}
          type="success"
          duration={5000}
          onClose={() => setShowNotification(false)}
        />
      )}
    </div>
  );
} 