'use client';

declare global {
  interface Window {
    hashpack: any;
  }
}

export function loadHashPack() {
  return new Promise((resolve, reject) => {
    if (window.hashpack) {
      resolve(window.hashpack);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.hashpack.app/hashpack.js';
    script.async = true;
    script.onload = () => resolve(window.hashpack);
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

export async function connectWallet() {
  try {
    const hashpack = await loadHashPack();
    const result = await hashpack.connect();
    return { success: true, accountId: result.accountId };
  } catch (error) {
    console.error('Failed to connect wallet:', error);
    return { success: false, error };
  }
}

export async function disconnectWallet() {
  try {
    const hashpack = await loadHashPack();
    await hashpack.disconnect();
    return { success: true };
  } catch (error) {
    console.error('Failed to disconnect wallet:', error);
    return { success: false, error };
  }
}

export async function signTransaction(transaction: any) {
  try {
    const hashpack = await loadHashPack();
    const result = await hashpack.signTransaction(transaction);
    return { success: true, result };
  } catch (error) {
    console.error('Failed to sign transaction:', error);
    return { success: false, error };
  }
} 