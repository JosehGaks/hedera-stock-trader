'use client';

import { db } from '../lib/firebase';
import { collection, getDocs, doc, getDoc, query, where, orderBy } from 'firebase/firestore';
import { Stock, StockOffer } from '../types/stock';

export async function getStocks(): Promise<Stock[]> {
  try {
    const stocksRef = collection(db, 'stocks');
    const snapshot = await getDocs(stocksRef);
    return snapshot.docs.map(doc => ({ ...doc.data(), tokenId: doc.id } as Stock));
  } catch (error) {
    console.error('Failed to fetch stocks:', error);
    return [];
  }
}

export async function getStock(tokenId: string): Promise<Stock | null> {
  try {
    const stockRef = doc(db, 'stocks', tokenId);
    const snapshot = await getDoc(stockRef);
    if (!snapshot.exists()) return null;
    return { ...snapshot.data(), tokenId: snapshot.id } as Stock;
  } catch (error) {
    console.error('Failed to fetch stock:', error);
    return null;
  }
}

export async function getOpenOffers(): Promise<StockOffer[]> {
  try {
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