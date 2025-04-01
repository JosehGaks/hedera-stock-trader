'use client';

import { db } from '../lib/firebase';
import { collection, getDocs, doc, getDoc, query, where, orderBy, Firestore } from 'firebase/firestore';
import { Stock, StockOffer } from '../types/stock';

// Determine if we're in development mode
const isDevelopment = process.env.NODE_ENV === 'development';

export async function getStocks(): Promise<Stock[]> {
  // In development, use the local API
  if (isDevelopment) {
    try {
      const response = await fetch('/api/stocks');
      if (!response.ok) {
        throw new Error('Failed to fetch stocks from API');
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch stocks from API:', error);
      return [];
    }
  }

  // In production, try Firestore first
  try {
    // Check if db is defined
    if (!db) {
      throw new Error('Firestore is not initialized');
    }
    
    const stocksRef = collection(db, 'stocks');
    const snapshot = await getDocs(stocksRef);
    if (snapshot.empty) {
      throw new Error('No stocks found in Firestore');
    }
    return snapshot.docs.map(doc => ({ ...doc.data(), tokenId: doc.id } as Stock));
  } catch (error) {
    console.error('Failed to fetch stocks from Firestore:', error);
    
    // Fallback to local API if Firestore fails
    try {
      const response = await fetch('/api/stocks');
      if (!response.ok) {
        throw new Error('Failed to fetch stocks from API fallback');
      }
      return await response.json();
    } catch (fallbackError) {
      console.error('Fallback API also failed:', fallbackError);
      return [];
    }
  }
}

export async function getStock(tokenId: string): Promise<Stock | null> {
  console.log(`Fetching stock with tokenId: ${tokenId}`);

  // In development, use the local API
  if (isDevelopment) {
    try {
      const response = await fetch('/api/stocks');
      if (!response.ok) {
        throw new Error('Failed to fetch stocks from API');
      }
      const stocks = await response.json();
      const stock = stocks.find((s: Stock) => s.tokenId === tokenId);
      
      if (!stock) {
        console.error(`Stock with tokenId ${tokenId} not found in API`);
        return null;
      }
      
      return stock;
    } catch (error) {
      console.error('Failed to fetch stock from API:', error);
      return null;
    }
  }

  // In production, try Firestore first
  try {
    // Check if db is defined
    if (!db) {
      throw new Error('Firestore is not initialized');
    }
    
    const stockRef = doc(db, 'stocks', tokenId);
    const snapshot = await getDoc(stockRef);
    
    if (!snapshot.exists()) {
      console.warn(`Stock with tokenId ${tokenId} not found in Firestore, trying API fallback`);
      // Fallback to local API
      const apiStock = await getStockFromApi(tokenId);
      return apiStock;
    }
    
    return { ...snapshot.data(), tokenId: snapshot.id } as Stock;
  } catch (error) {
    console.error('Failed to fetch stock from Firestore:', error);
    // Fallback to local API
    return await getStockFromApi(tokenId);
  }
}

// Helper function to get stock from API
async function getStockFromApi(tokenId: string): Promise<Stock | null> {
  try {
    const response = await fetch('/api/stocks');
    if (!response.ok) {
      throw new Error('Failed to fetch stocks from API fallback');
    }
    const stocks = await response.json();
    const stock = stocks.find((s: Stock) => s.tokenId === tokenId);
    
    if (!stock) {
      console.error(`Stock with tokenId ${tokenId} not found in API fallback`);
      return null;
    }
    
    return stock;
  } catch (error) {
    console.error('Failed to fetch stock from API fallback:', error);
    return null;
  }
}

export async function getOpenOffers(): Promise<StockOffer[]> {
  try {
    // Check if db is defined
    if (!db) {
      throw new Error('Firestore is not initialized');
    }
    
    const offersRef = collection(db, 'trades');
    const q = query(
      offersRef,
      where('status', '==', 'open'),
      orderBy('timestamp', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as StockOffer));
  } catch (error) {
    console.error('Failed to fetch open offers:', error);
    return [];
  }
}

export async function getUserOffers(accountId: string): Promise<StockOffer[]> {
  try {
    // Check if db is defined
    if (!db) {
      throw new Error('Firestore is not initialized');
    }
    
    const offersRef = collection(db, 'trades');
    const q = query(
      offersRef,
      where('offererId', '==', accountId),
      orderBy('timestamp', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as StockOffer));
  } catch (error) {
    console.error('Failed to fetch user offers:', error);
    return [];
  }
} 