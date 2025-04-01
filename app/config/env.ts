'use client';

import { z } from 'zod';

const envSchema = z.object({
  // Firebase
  NEXT_PUBLIC_FIREBASE_API_KEY: z.string().min(1, 'Firebase API Key is required'),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string().min(1, 'Firebase Auth Domain is required'),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().min(1, 'Firebase Project ID is required'),
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z.string().min(1, 'Firebase Storage Bucket is required'),
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z.string().min(1, 'Firebase Messaging Sender ID is required'),
  NEXT_PUBLIC_FIREBASE_APP_ID: z.string().min(1, 'Firebase App ID is required'),
  NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: z.string().min(1, 'Firebase Measurement ID is required'),
  FIREBASE_SERVICE_ACCOUNT_PATH: z.string().min(1, 'Firebase Service Account Path is required'),

  // Hedera
  NEXT_PUBLIC_HEDERA_NETWORK: z.enum(['mainnet', 'testnet'], {
    errorMap: () => ({ message: 'Hedera Network must be either "mainnet" or "testnet"' }),
  }),
  NEXT_PUBLIC_HEDERA_MIRROR_NODE_URL: z.string().url('Invalid Hedera Mirror Node URL'),
  NEXT_PUBLIC_HEDERA_ACCOUNT_ID: z.string().min(1, 'Hedera Account ID is required'),
  NEXT_PUBLIC_HEDERA_PRIVATE_KEY: z.string().min(1, 'Hedera Private Key is required'),

  // HCS
  NEXT_PUBLIC_HCS_TOPIC_ID: z.string().min(1, 'HCS Topic ID is required'),

  // API
  NEXT_PUBLIC_API_URL: z.string().url('Invalid API URL'),
});

// Create a type for the environment variables
type Env = z.infer<typeof envSchema>;

// Function to validate environment variables
function validateEnv(): Env {
  try {
    // For client-side, we need to access window._env
    if (typeof window !== 'undefined') {
      return envSchema.parse(window._env);
    }
    // For server-side, use process.env
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map((err) => err.path.join('.')).join(', ');
      console.error(`Missing or invalid environment variables: ${missingVars}`);
      // Return default values for development
      return {
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
    throw error;
  }
}

// Export validated environment variables
export const env = validateEnv();

export const firebaseConfig = {
  apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

export const hederaConfig = {
  network: env.NEXT_PUBLIC_HEDERA_NETWORK,
  mirrorNodeUrl: env.NEXT_PUBLIC_HEDERA_MIRROR_NODE_URL,
  accountId: env.NEXT_PUBLIC_HEDERA_ACCOUNT_ID,
  privateKey: env.NEXT_PUBLIC_HEDERA_PRIVATE_KEY,
}; 