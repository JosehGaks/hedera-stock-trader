'use client';

import { useAuthStore } from '../store/auth';

let hashConnect: any = null;

export function loadHashConnect() {
  if (typeof window !== 'undefined' && window.HashConnect && !hashConnect) {
    hashConnect = new window.HashConnect();
  }
  return hashConnect;
}

export async function connectWallet() {
  try {
    const hashConnect = loadHashConnect();
    if (!hashConnect) {
      throw new Error('HashConnect not initialized');
    }

    // Initialize HashConnect
    const initData = await hashConnect.init();
    
    // Connect to HashPack
    const state = await hashConnect.connect();
    
    // Get the connected account
    const accountId = state.accountIds[0];
    
    // Update auth store with the connected account
    useAuthStore.getState().setUser({
      accountId,
      isConnected: true,
    });

    return { success: true, accountId };
  } catch (error) {
    console.error('Failed to connect wallet:', error);
    return { success: false, error };
  }
}

export async function disconnectWallet() {
  try {
    const hashConnect = loadHashConnect();
    if (!hashConnect) {
      throw new Error('HashConnect not initialized');
    }

    await hashConnect.disconnect();
    useAuthStore.getState().setUser(null);
    return { success: true };
  } catch (error) {
    console.error('Failed to disconnect wallet:', error);
    return { success: false, error };
  }
}

export async function signTransaction(transaction: any) {
  try {
    const hashConnect = loadHashConnect();
    if (!hashConnect) {
      throw new Error('HashConnect not initialized');
    }

    const result = await hashConnect.sendTransaction(transaction);
    return { success: true, result };
  } catch (error) {
    console.error('Failed to sign transaction:', error);
    return { success: false, error };
  }
} 