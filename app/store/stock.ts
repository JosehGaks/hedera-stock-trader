'use client';

import { create } from 'zustand';
import { Stock, StockOffer } from '../types/stock';
import * as stockService from '../services/stock';

interface StockState {
  stocks: Stock[];
  selectedStock: Stock | null;
  openOffers: StockOffer[];
  userOffers: StockOffer[];
  isLoading: boolean;
  error: string | null;
  fetchStocks: () => Promise<void>;
  fetchStock: (tokenId: string) => Promise<void>;
  fetchOpenOffers: () => Promise<void>;
  fetchUserOffers: (accountId: string) => Promise<void>;
}

export const useStockStore = create<StockState>((set) => ({
  stocks: [],
  selectedStock: null,
  openOffers: [],
  userOffers: [],
  isLoading: false,
  error: null,

  fetchStocks: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await fetch('/api/stocks');
      if (!response.ok) {
        throw new Error('Failed to fetch stocks');
      }
      const data = await response.json();
      set({ stocks: data, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to load stocks', isLoading: false });
    }
  },

  fetchStock: async (tokenId: string) => {
    try {
      set({ isLoading: true, error: null });
      const stock = await stockService.getStock(tokenId);
      set({ selectedStock: stock, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch stock details', isLoading: false });
    }
  },

  fetchOpenOffers: async () => {
    try {
      set({ isLoading: true, error: null });
      const offers = await stockService.getOpenOffers();
      set({ openOffers: offers, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch open offers', isLoading: false });
    }
  },

  fetchUserOffers: async (accountId: string) => {
    try {
      set({ isLoading: true, error: null });
      const offers = await stockService.getUserOffers(accountId);
      set({ userOffers: offers, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch user offers', isLoading: false });
    }
  },
})); 