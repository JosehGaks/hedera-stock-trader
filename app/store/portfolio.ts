'use client';

import { create } from 'zustand';
import { Stock } from '../types/stock';

interface PortfolioItem {
  stock: Stock;
  balance: number;
  value: number;
  change24h: number;
  lastUpdated: string;
}

interface PortfolioState {
  items: PortfolioItem[];
  isLoading: boolean;
  error: string | null;
  lastTransaction: {
    type: 'buy' | 'sell';
    stockId: string;
    amount: number;
    price: number;
    timestamp: string;
  } | null;
  fetchPortfolio: () => Promise<void>;
  addTransaction: (type: 'buy' | 'sell', stockId: string, amount: number, price: number) => void;
  clearPortfolio: () => void;
}

export const usePortfolioStore = create<PortfolioState>((set, get) => ({
  items: [],
  isLoading: false,
  error: null,
  lastTransaction: null,
  
  fetchPortfolio: async () => {
    set({ isLoading: true, error: null });
    
    try {
      // In a real app, this would fetch from an API
      // For now, we'll use mock data for the demo
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate mock portfolio data
      const mockPortfolio: PortfolioItem[] = [
        {
          stock: {
            tokenId: 'AAPL',
            name: 'Apple Inc',
            symbol: 'AAPL',
            description: 'Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide.',
            sector: 'Technology',
            country: 'US',
            market: 'NASDAQ',
            mockPrice: 175.23,
            logo: 'https://logo.clearbit.com/apple.com',
            isUSStock: true,
            priceHistory: [],
            marketCap: 2800000000000,
            volume24h: 55000000,
          },
          balance: 10.5,
          value: 1839.92,
          change24h: 1.2,
          lastUpdated: new Date().toISOString(),
        },
        {
          stock: {
            tokenId: 'MSFT',
            name: 'Microsoft Corporation',
            symbol: 'MSFT',
            description: 'Microsoft Corporation develops, licenses, and supports software, services, devices, and solutions worldwide.',
            sector: 'Technology',
            country: 'US',
            market: 'NASDAQ',
            mockPrice: 383.28,
            logo: 'https://logo.clearbit.com/microsoft.com',
            isUSStock: true,
            priceHistory: [],
            marketCap: 2900000000000,
            volume24h: 22000000,
          },
          balance: 5.25,
          value: 2012.22,
          change24h: 2.5,
          lastUpdated: new Date().toISOString(),
        },
      ];
      
      set({ items: mockPortfolio, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch portfolio:', error);
      set({ error: 'Failed to load portfolio data', isLoading: false });
    }
  },
  
  addTransaction: (type, stockId, amount, price) => {
    // Record the transaction
    set({
      lastTransaction: {
        type,
        stockId,
        amount,
        price,
        timestamp: new Date().toISOString()
      }
    });
    
    // Update portfolio items
    const items = [...get().items];
    const existingItemIndex = items.findIndex(item => item.stock.tokenId === stockId);
    
    if (existingItemIndex >= 0) {
      // Update existing position
      const item = { ...items[existingItemIndex] };
      
      if (type === 'buy') {
        item.balance += amount;
      } else {
        item.balance -= amount;
      }
      
      item.value = item.balance * price;
      item.lastUpdated = new Date().toISOString();
      
      // Remove item if balance is 0
      if (item.balance <= 0) {
        items.splice(existingItemIndex, 1);
      } else {
        items[existingItemIndex] = item;
      }
    } else if (type === 'buy') {
      // Add new position
      // In a real app, we would fetch the stock data first
      items.push({
        stock: {
          tokenId: stockId,
          name: `Stock ${stockId}`,
          symbol: stockId,
          description: 'Stock description',
          sector: 'Technology',
          country: 'US',
          market: 'NASDAQ',
          mockPrice: price,
          logo: '',
          isUSStock: true,
          priceHistory: [],
          marketCap: 0,
          volume24h: 0,
        },
        balance: amount,
        value: amount * price,
        change24h: 0,
        lastUpdated: new Date().toISOString(),
      });
    }
    
    set({ items });
  },
  
  clearPortfolio: () => {
    set({ items: [], lastTransaction: null });
  }
})); 