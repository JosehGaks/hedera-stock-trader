'use client';

import React from 'react';
import Link from 'next/link';

interface TradeSuccessProps {
  transactionId: string;
  timestamp: string;
  balance: number;
  value: number;
  onTradeAgain: () => void;
}

export default function TradeSuccess({
  transactionId,
  timestamp,
  balance,
  value,
  onTradeAgain
}: TradeSuccessProps) {
  return (
    <div className="animate-fadeIn bg-green-50 p-6 rounded-lg border border-green-100 shadow-sm">
      <div className="flex items-center justify-center mb-4">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
      </div>
      <h3 className="text-center font-bold text-lg text-green-800 mb-2">Transaction Successful!</h3>
      <div className="flex justify-between text-sm mb-2">
        <span className="text-gray-700">Transaction ID</span>
        <span className="font-medium text-gray-900">
          {transactionId.slice(0, 6)}...{transactionId.slice(-4)}
        </span>
      </div>
      <div className="text-xs text-center text-gray-600 mb-4">
        {new Date(timestamp).toLocaleString()}
      </div>
      <div className="flex justify-between items-center">
        <div className="bg-white px-3 py-2 rounded-lg border border-gray-200">
          <div className="text-xs text-gray-500">New Balance</div>
          <div className="font-bold text-gray-900">{balance.toFixed(6)} shares</div>
        </div>
        <div className="bg-white px-3 py-2 rounded-lg border border-gray-200">
          <div className="text-xs text-gray-500">Value</div>
          <div className="font-bold text-gray-900">${value.toFixed(2)}</div>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-2 mt-4">
        <Link 
          href="/portfolio" 
          className="flex-1 bg-blue-600 text-white text-center px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          View Portfolio
        </Link>
        <button 
          onClick={onTradeAgain} 
          className="flex-1 bg-gray-100 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-200 transition"
        >
          Trade Again
        </button>
      </div>
    </div>
  );
} 