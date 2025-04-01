'use client';

import { useEffect } from 'react';

// Add window type declaration
declare global {
  interface Window {
    _env: {
      [key: string]: string;
    };
  }
}

// This component injects environment variables into the window object
export default function EnvInjector() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window._env = window._env || {};
      
      // Add any environment variables that need to be exposed to the client
      const defaultEnv = {
        API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
        HEDERA_NETWORK: process.env.NEXT_PUBLIC_HEDERA_NETWORK || 'testnet',
        DEMO_MODE: process.env.NEXT_PUBLIC_DEMO_MODE || 'true',
      };
      
      // Merge with any existing _env values
      window._env = { ...defaultEnv, ...window._env };
      
      console.log('Environment variables injected:', window._env);
    }
  }, []);

  return null; // This component doesn't render anything
} 