'use client';

// This script will be injected into the page to make environment variables available to the client
export function injectEnv() {
  if (typeof window !== 'undefined') {
    window._env = {
      NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
      NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
      NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
      NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
      NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || '',
      FIREBASE_SERVICE_ACCOUNT_PATH: process.env.FIREBASE_SERVICE_ACCOUNT_PATH || '',
      NEXT_PUBLIC_HEDERA_NETWORK: (process.env.NEXT_PUBLIC_HEDERA_NETWORK as 'mainnet' | 'testnet') || 'testnet',
      NEXT_PUBLIC_HEDERA_MIRROR_NODE_URL: process.env.NEXT_PUBLIC_HEDERA_MIRROR_NODE_URL || 'https://testnet.mirrornode.hedera.com',
      NEXT_PUBLIC_HEDERA_ACCOUNT_ID: process.env.NEXT_PUBLIC_HEDERA_ACCOUNT_ID || '',
      NEXT_PUBLIC_HEDERA_PRIVATE_KEY: process.env.NEXT_PUBLIC_HEDERA_PRIVATE_KEY || '',
      NEXT_PUBLIC_HCS_TOPIC_ID: process.env.NEXT_PUBLIC_HCS_TOPIC_ID || '',
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
    };
  }
} 