'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/app/store/auth';
import { HederaService } from '../../services/hedera';
import { PriceService } from '../../services/price';
import { TokenizationService } from '@/app/services/tokenization';
import { TokenMetadataService } from '@/app/services/tokenMetadata';
import TradeSuccess from './TradeSuccess';

interface TokenMetadata {
  name: string;
  symbol: string;
  description: string;
  sector: string;
  country: string;
  market: string;
  price: number;
  volume: number;
  marketCap: number;
  isUSStock: boolean;
  lastUpdated: string;
  averageCost: number;
}

interface TradePanelProps {
  stock: {
    tokenId: string;
    name: string;
    price: number;
    isUSStock: boolean;
  };
  onTradeComplete?: () => void;
}

interface TransactionStatus {
  success: boolean;
  transactionId: string;
  timestamp: string;
}

interface PriceData {
  price: number;
  change24h: number;
}

// Add type definition for result
interface TokenTransferResult {
  success: boolean;
  transactionId?: string;
  error?: string;
}

export function TradePanel({ stock, onTradeComplete }: TradePanelProps) {
  const { user } = useAuthStore();
  const [amount, setAmount] = useState('');
  const [isBuying, setIsBuying] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [balance, setBalance] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [transactionStatus, setTransactionStatus] = useState<{
    success: boolean;
    transactionId?: string;
    timestamp?: string;
  } | null>(null);
  const [priceData, setPriceData] = useState<PriceData | null>(null);
  const [profitLoss, setProfitLoss] = useState<{
    total: number;
    percentage: number;
    averageCost: number;
  } | null>(null);
  const [metadata, setMetadata] = useState<TokenMetadata | null>(null);
  const [amountError, setAmountError] = useState<string | null>(null);
  const [demoModeActive, setDemoModeActive] = useState<boolean>(true);
  const [instantFeedback, setInstantFeedback] = useState<string | null>(null);

  const hederaService = HederaService.getInstance();
  const priceService = PriceService.getInstance();

  useEffect(() => {
    if (stock.tokenId) {
      fetchBalance();
      fetchProfitLoss();
    }
  }, [stock.tokenId]);

  const fetchBalance = async () => {
    try {
      const balance = await TokenizationService.getInstance().getTokenBalance(stock.tokenId);
      setBalance(balance);
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  const fetchProfitLoss = async () => {
    try {
      const metadataResponse = await TokenMetadataService.getInstance().getTokenMetadata(stock.tokenId);
      setMetadata(metadataResponse);
      
      if (metadataResponse) {
        const averageCost = metadataResponse.averageCost || 0;
        const stockPrice = stock.price || 0;
        const currentBalance = balance || 0;
        const total = (stockPrice - averageCost) * currentBalance;
        const percentage = averageCost > 0 ? ((stockPrice - averageCost) / averageCost) * 100 : 0;
        
        setProfitLoss({
          total,
          percentage,
          averageCost
        });
      } else {
        console.warn('Token metadata not available, using fallback values');
        const stockPrice = stock.price || 0;
        setProfitLoss({
          total: 0,
          percentage: 0,
          averageCost: stockPrice * 0.9
        });
      }
    } catch (error) {
      console.error('Error fetching profit/loss:', error);
      const stockPrice = stock.price || 0;
      setProfitLoss({
        total: 0,
        percentage: 0,
        averageCost: stockPrice * 0.9
      });
    }
  };

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

  // Validate amount in real-time
  useEffect(() => {
    if (!amount) {
      setAmountError(null);
      return;
    }
    
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setAmountError('Amount must be greater than 0');
    } else if (!isBuying && numAmount > balance) {
      setAmountError('Insufficient balance');
    } else {
      setAmountError(null);
      
      // Show positive feedback for valid inputs
      if (isBuying) {
        setInstantFeedback(`You'll own ${(balance || 0) + numAmount} shares after this purchase`);
      } else {
        setInstantFeedback(`You'll have ${(balance || 0) - numAmount} shares remaining after selling`);
      }
    }
    
    // Clear feedback after 3 seconds
    const timer = setTimeout(() => {
      setInstantFeedback(null);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [amount, isBuying, balance]);

  // Update for switching between buy/sell
  useEffect(() => {
    // Clear amount when switching between buy/sell
    setAmount('');
    setAmountError(null);
    setInstantFeedback(null);
  }, [isBuying]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  };

  // Add quick amount buttons for better UX
  const handleQuickAmount = (percentage: number) => {
    if (isBuying) {
      // For buying, base on a reasonable default (e.g., 1 share)
      const baseAmount = 1;
      setAmount((baseAmount * percentage / 100).toFixed(6));
    } else {
      // For selling, base on current balance
      const maxAmount = balance || 0;
      setAmount((maxAmount * percentage / 100).toFixed(6));
    }
  };

  const handleTrade = async () => {
    if (!amount || !user) return;

    setIsLoading(true);
    setError(null);

    try {
      // For demo purposes, simulate a successful transaction
      const demoMode = true; // Set to false when connecting to real Hedera network
      
      if (demoMode) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Generate mock transaction ID
        const mockTxId = `0.0.${Math.floor(Math.random() * 9000000) + 1000000}`;
        
        // Update UI for demo
        setTransactionStatus({
          success: true,
          transactionId: mockTxId,
          timestamp: new Date().toISOString()
        });
        
        // Update balance for demo (add for buy, subtract for sell)
        const newBalance = isBuying 
          ? (balance || 0) + parseFloat(amount)
          : (balance || 0) - parseFloat(amount);
        setBalance(newBalance);
        
        // Update profit/loss for demo
        if (metadata) {
          const newTotal = (stock.price - (profitLoss?.averageCost || 0)) * newBalance;
          const newPercentage = (profitLoss?.averageCost || 0) > 0 
            ? ((stock.price - (profitLoss?.averageCost || 0)) / (profitLoss?.averageCost || 0)) * 100 
            : 0;
          
          setProfitLoss({
            total: newTotal,
            percentage: newPercentage,
            averageCost: profitLoss?.averageCost || stock.price * 0.9
          });
        }
        
        // Clear form
        setAmount('');
        
        // Notify parent component
        onTradeComplete?.();
        
        return;
      }

      // Real implementation for production
      const result = await TokenizationService.getInstance().transferTokens(
        stock.tokenId,
        user.accountId,
        parseFloat(amount)
      ) as TokenTransferResult;

      if (result.success) {
        setTransactionStatus({
          success: true,
          transactionId: result.transactionId || 'unknown',
          timestamp: new Date().toISOString()
        });
        await fetchBalance();
        await fetchProfitLoss();
        onTradeComplete?.();
        setAmount('');
      } else {
        setError(result.error || 'Failed to complete trade');
      }
    } catch (error) {
      console.error('Error during trade:', error);
      setError('Failed to complete trade. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const validateAmount = (): string | null => {
    if (!amount) return 'Amount is required';
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return 'Amount must be greater than 0';
    if (!isBuying && numAmount > balance) return 'Insufficient balance';
    return null;
  };

  const currentPrice = priceData?.price || stock.price || 0;
  const amountValue = parseFloat(amount || '0') || 0;
  const totalPrice = amountValue * currentPrice;

  // Add reset function
  const resetTransaction = () => {
    setTransactionStatus(null);
    setAmount('');
  };

  return (
    <div className="space-y-4">
      {balance !== null && !transactionStatus && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100">
          <div className="flex justify-between items-center">
            <span className="text-blue-700 font-medium">Your Balance</span>
            <div className="flex flex-col items-end">
              <span className="font-bold text-blue-700">{(balance || 0).toFixed(6)}</span>
              <span className="text-xs text-blue-500">shares</span>
            </div>
          </div>
        </div>
      )}

      {transactionStatus ? (
        <TradeSuccess 
          transactionId={transactionStatus.transactionId || 'unknown'}
          timestamp={transactionStatus.timestamp || new Date().toISOString()}
          balance={balance || 0}
          value={(balance || 0) * (currentPrice || 0)}
          onTradeAgain={resetTransaction}
        />
      ) : (
        <>
          <div className="flex space-x-2">
            <button
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
                isBuying
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setIsBuying(true)}
            >
              Buy
            </button>
            <button
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
                !isBuying
                  ? 'bg-red-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setIsBuying(false)}
            >
              Sell
            </button>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-gray-700">
                Amount {isBuying ? 'to buy' : 'to sell'} (fractional shares)
              </label>
              {!isBuying && balance > 0 && (
                <button 
                  onClick={() => setAmount(balance.toString())}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  Max: {balance.toFixed(6)}
                </button>
              )}
            </div>
            <div className="relative">
              <input
                type="number"
                step="0.000001"
                value={amount}
                onChange={handleAmountChange}
                placeholder="Enter amount"
                className={`block w-full px-3 py-2 border ${amountError ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} rounded-lg shadow-sm`}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500">shares</span>
              </div>
            </div>
            {amountError && <p className="mt-1 text-sm text-red-600">{amountError}</p>}
            {!amountError && instantFeedback && <p className="mt-1 text-sm text-green-600">{instantFeedback}</p>}
            
            {/* Quick amount buttons */}
            <div className="mt-2 flex justify-between space-x-2">
              <button 
                onClick={() => handleQuickAmount(25)}
                className="flex-1 text-xs py-1 px-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
              >
                25%
              </button>
              <button 
                onClick={() => handleQuickAmount(50)}
                className="flex-1 text-xs py-1 px-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
              >
                50%
              </button>
              <button 
                onClick={() => handleQuickAmount(75)}
                className="flex-1 text-xs py-1 px-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
              >
                75%
              </button>
              <button 
                onClick={() => handleQuickAmount(100)}
                className="flex-1 text-xs py-1 px-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
              >
                100%
              </button>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Price per share</span>
              <div className="text-right">
                <span className="font-medium">${(currentPrice || 0).toFixed(2)}</span>
                {priceData && (
                  <span className={`ml-2 text-xs font-medium ${
                    priceData.change24h >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {priceData.change24h >= 0 ? '+' : ''}{(priceData.change24h || 0).toFixed(2)}%
                  </span>
                )}
              </div>
            </div>
            <div className="flex justify-between text-sm mt-2">
              <span className="text-gray-500">Total</span>
              <span className="font-medium">${(totalPrice || 0).toFixed(2)}</span>
            </div>
          </div>

          {profitLoss && (
            <div className="p-4 rounded-lg border border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Position Summary</h3>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-xs text-gray-500">Average Cost</p>
                  <p className="font-medium">${(profitLoss.averageCost || 0).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Profit/Loss</p>
                  <p className={`font-medium ${profitLoss.total >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {profitLoss.total >= 0 ? '+' : ''}${(profitLoss.total || 0).toFixed(2)} 
                    <span className="text-xs">({(profitLoss.percentage || 0).toFixed(2)}%)</span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 p-3 rounded-lg border border-red-100">
              <div className="text-red-600 text-sm">{error}</div>
            </div>
          )}

          <button
            onClick={handleTrade}
            disabled={isLoading || !amount || validateAmount() !== null}
            className={`w-full py-3 px-4 rounded-lg font-medium text-white shadow-md transition-all duration-200 ${
              isLoading || !amount || validateAmount() !== null
                ? 'bg-gray-400 cursor-not-allowed'
                : isBuying
                ? 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg'
                : 'bg-red-600 hover:bg-red-700 hover:shadow-lg'
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing...
              </span>
            ) : (
              `${isBuying ? 'Buy' : 'Sell'} ${stock.name}`
            )}
          </button>
          
          {validateAmount() && (
            <div className="text-red-500 text-sm">{validateAmount()}</div>
          )}

          {demoModeActive && (
            <div className="bg-yellow-50 p-2 rounded-lg border border-yellow-100">
              <p className="text-xs text-yellow-800 text-center">
                Demo Mode Active - No actual transactions will occur
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
} 