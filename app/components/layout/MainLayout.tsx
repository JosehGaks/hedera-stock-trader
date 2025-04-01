'use client';

import React from 'react';
import { Inter } from 'next/font/google';
import { ConnectWalletButton } from '../auth/ConnectWalletButton';
import { useAuthStore } from '../../store/auth';

const inter = Inter({ subsets: ['latin'] });

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const { user, signOut } = useAuthStore();

  return (
    <div className={`min-h-screen bg-gray-50 ${inter.className}`}>
      <header className="bg-white shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-xl font-bold text-gray-900">AfriStocks</span>
              </div>
            </div>
            <div className="flex items-center">
              {user ? (
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-700">
                    {user.displayName || 'Connected Wallet'}
                  </span>
                  <button
                    onClick={signOut}
                    className="text-sm text-gray-700 hover:text-gray-900"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <ConnectWalletButton />
              )}
            </div>
          </div>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>

      <footer className="bg-white border-t">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            © {new Date().getFullYear()} AfriStocks. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
} 