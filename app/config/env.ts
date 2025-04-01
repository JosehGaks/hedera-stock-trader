'use client';

import { z } from 'zod';

// Check if running in browser
const isBrowser = typeof window !== 'undefined';

// Making the schema more lenient with defaults for all fields
const envSchema = z.object({
  // Firebase
  NEXT_PUBLIC_FIREBASE_API_KEY: z.string().default(''),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string().default(''),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().default(''),
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z.string().default(''),
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z.string().default(''),
  NEXT_PUBLIC_FIREBASE_APP_ID: z.string().default(''),
  NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: z.string().default(''),
  FIREBASE_SERVICE_ACCOUNT_PATH: z.string().default('./firebase-service-account.json'),

  // Hedera
  NEXT_PUBLIC_HEDERA_NETWORK: z.enum(['mainnet', 'testnet']).default('testnet'),
  NEXT_PUBLIC_HEDERA_MIRROR_NODE_URL: z.string().default('https://testnet.mirrornode.hedera.com'),
  NEXT_PUBLIC_HEDERA_ACCOUNT_ID: z.string().default('0.0.5784768'),
  NEXT_PUBLIC_HEDERA_PRIVATE_KEY: z.string().default('0xd2af43c5bc46b2b92e0a16822ddd000b412a25d99cb87526e28955e778dd1594'),

  // HCS
  NEXT_PUBLIC_HCS_TOPIC_ID: z.string().default('0.0.5791775'),

  // API
  NEXT_PUBLIC_API_URL: z.string().default('http://localhost:3001/api'),
  
  // Alpha Vantage
  NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY: z.string().default(''),
});

// Create a type for the environment variables
type Env = z.infer<typeof envSchema>;

// Function to get environment variables from browser window
function getBrowserEnv(): Record<string, string> {
  if (!isBrowser) {
    return {};
  }

  // Use window._env if available, otherwise fall back to process.env
  if (window._env) {
    // Log only non-sensitive information for debugging
    console.log('Using window._env for environment variables', {
      API_KEY_SET: Boolean(window._env.NEXT_PUBLIC_FIREBASE_API_KEY),
      AUTH_DOMAIN_SET: Boolean(window._env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN),
      PROJECT_ID_SET: Boolean(window._env.NEXT_PUBLIC_FIREBASE_PROJECT_ID)
    });
    return window._env;
  }

  console.warn('window._env not found, falling back to process.env');
  return process.env as Record<string, string>;
}

// Function to validate environment variables
function validateEnv(): Env {
  try {
    // For client-side, use getBrowserEnv
    if (isBrowser) {
      const browserEnv = getBrowserEnv();
      return envSchema.parse(browserEnv);
    }
    
    // For server-side, use process.env
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map((err) => err.path.join('.')).join(', ');
      console.error(`Missing or invalid environment variables: ${missingVars}`);
      // Return default values
      return envSchema.parse({});
    }
    throw error;
  }
}

// Export validated environment variables
export const env = validateEnv();

// Log non-sensitive parts of the configuration
if (isBrowser) {
  console.log('Firebase Configuration:', {
    apiKeySet: Boolean(env.NEXT_PUBLIC_FIREBASE_API_KEY),
    authDomainSet: Boolean(env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN),
    projectIdSet: Boolean(env.NEXT_PUBLIC_FIREBASE_PROJECT_ID),
    storageBucketSet: Boolean(env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET)
  });
}

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