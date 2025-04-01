'use client';

import React from 'react';
import { useAuthStore } from '../../store/auth';
import { connectWallet } from '../../services/hashpack';

export function ConnectWalletButton() {
  const { signIn, loading } = useAuthStore();

  const handleConnect = async () => {
    try {
      const result = await connectWallet();
      if (result.success) {
        signIn();
      } else {
        console.error('Failed to connect wallet:', result.error);
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  return (
    <button
      onClick={handleConnect}
      disabled={loading}
      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? (
        <span className="flex items-center">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Connecting...
        </span>
      ) : (
        'Connect HashPack Wallet'
      )}
    </button>
  );
} 