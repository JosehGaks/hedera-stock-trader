'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/app/store/auth';
import { HederaService } from '../../services/hedera';
import { PriceService } from '../../services/price';
import { TokenizationService } from '@/app/services/tokenization';
import { TokenMetadataService } from '@/app/services/tokenMetadata';

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
      const metadata = await TokenMetadataService.getInstance().getTokenMetadata(stock.tokenId);
      if (metadata) {
        const averageCost = metadata.averageCost || 0;
        const total = (stock.price - averageCost) * balance;
        const percentage = averageCost > 0 ? ((stock.price - averageCost) / averageCost) * 100 : 0;
        
        setProfitLoss({
          total,
          percentage,
          averageCost
        });
      }
    } catch (error) {
      console.error('Error fetching profit/loss:', error);
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

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  };

  const handleTrade = async () => {
    if (!amount || !user) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await TokenizationService.getInstance().transferTokens(
        stock.tokenId,
        user.accountId,
        parseFloat(amount)
      );

      if (result.success) {
        setTransactionStatus({
          success: true,
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
      setError('Failed to complete trade');
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

  const currentPrice = priceData?.price || stock.price;
  const totalPrice = parseFloat(amount || '0') * currentPrice;

  return (
    <div className="space-y-4">
      {balance !== null && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex justify-between text-sm">
            <span className="text-blue-700">Your Balance</span>
            <span className="font-medium text-blue-700">{balance.toFixed(6)} shares</span>
          </div>
        </div>
      )}

      <div className="flex space-x-2">
        <button
          className={`flex-1 py-2 px-4 rounded-lg font-medium ${
            isBuying
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700'
          }`}
          onClick={() => setIsBuying(true)}
        >
          Buy
        </button>
        <button
          className={`flex-1 py-2 px-4 rounded-lg font-medium ${
            !isBuying
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700'
          }`}
          onClick={() => setIsBuying(false)}
        >
          Sell
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Amount (fractional shares)
        </label>
        <div className="relative">
          <input
            type="number"
            step="0.000001"
            value={amount}
            onChange={handleAmountChange}
            placeholder="Enter amount"
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-gray-500">shares</span>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Price per share</span>
          <div className="text-right">
            <span className="font-medium">${currentPrice.toFixed(2)}</span>
            {priceData && (
              <span className={`ml-2 text-xs ${
                priceData.change24h >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {priceData.change24h >= 0 ? '+' : ''}{priceData.change24h.toFixed(2)}%
              </span>
            )}
          </div>
        </div>
        <div className="flex justify-between text-sm mt-2">
          <span className="text-gray-500">Total</span>
          <span className="font-medium">${totalPrice.toFixed(2)}</span>
        </div>
      </div>

      {profitLoss && (
        <div className="text-sm">
          <p className={`font-medium ${profitLoss.total >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            Profit/Loss: ${profitLoss.total.toFixed(2)} ({profitLoss.percentage.toFixed(2)}%)
          </p>
          <p className="text-gray-600">Average Cost: ${profitLoss.averageCost.toFixed(2)}</p>
        </div>
      )}

      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}

      {transactionStatus && (
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex justify-between text-sm">
            <span className="text-green-700">Transaction ID</span>
            <span className="font-medium text-green-700">
              {transactionStatus.transactionId?.slice(0, 6)}...{transactionStatus.transactionId?.slice(-4)}
            </span>
          </div>
          <div className="text-xs text-green-600 mt-1">
            {new Date(transactionStatus.timestamp || '').toLocaleString()}
          </div>
        </div>
      )}

      <button
        onClick={handleTrade}
        disabled={isLoading || !amount || validateAmount() !== null}
        className={`w-full py-3 px-4 rounded-lg font-medium text-white ${
          isLoading || !amount || validateAmount() !== null
            ? 'bg-gray-400 cursor-not-allowed'
            : isBuying
            ? 'bg-blue-600 hover:bg-blue-700'
            : 'bg-red-600 hover:bg-red-700'
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
        <p className="text-red-500 text-sm">{validateAmount()}</p>
      )}
    </div>
  );
} 