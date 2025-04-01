'use client';

import Script from 'next/script';
import { useEffect } from 'react';

export default function HashConnectScript() {
  useEffect(() => {
    // Check if we're running on HTTPS or localhost
    const isSecure = window.location.protocol === 'https:' || window.location.hostname === 'localhost';
    if (!isSecure) {
      console.warn('HashConnect requires HTTPS or localhost to work properly');
    }
  }, []);

  return (
    <Script
      src="https://cdn.hashpack.app/hashconnect.js"
      strategy="beforeInteractive"
      onError={(e) => {
        console.error('Error loading HashConnect:', e);
      }}
      onLoad={() => {
        console.log('HashConnect script loaded successfully');
        // Initialize HashConnect after script loads
        if (typeof window !== 'undefined' && window.HashConnect) {
          console.log('HashConnect is available');
        }
      }}
      crossOrigin="anonymous"
      id="hashconnect-script"
    />
  );
} 