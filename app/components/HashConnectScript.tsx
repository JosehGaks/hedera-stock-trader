'use client';

import Script from 'next/script';
import { useEffect, useState } from 'react';

// Declare global types for window
declare global {
  interface Window {
    HashConnect: any;
    _hashConnectLoaded: boolean;
  }
}

export default function HashConnectScript() {
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    // Check if we're running on HTTPS or localhost
    const isSecure = window.location.protocol === 'https:' || window.location.hostname === 'localhost';
    if (!isSecure) {
      console.warn('HashConnect requires HTTPS or localhost to work properly');
    }

    // Check if HashConnect is already available on the window
    if (typeof window !== 'undefined' && window.HashConnect) {
      console.log('HashConnect is already available');
      setScriptLoaded(true);
      // Dispatch event to inform other components
      window.dispatchEvent(new Event('hashconnect-loaded'));
      return;
    }

    // Create a global variable to track script loading status
    if (typeof window !== 'undefined') {
      window._hashConnectLoaded = false;
    }

    // Try alternate loading method if script isn't loaded after delay
    const timer = setTimeout(() => {
      if (typeof window !== 'undefined' && !window.HashConnect && !scriptLoaded) {
        loadHashConnectDirectly();
      }
    }, 2000);

    return () => {
      clearTimeout(timer);
    };
  }, [scriptLoaded]);

  // Function to load HashConnect via script tag
  const loadHashConnectDirectly = () => {
    const existingScript = document.getElementById('hashconnect-script-direct');
    if (existingScript) {
      return; // Don't add duplicate script
    }

    console.log('Loading HashConnect directly via script tag');
    const script = document.createElement('script');
    script.src = '/hashconnect.js'; // Use local version to avoid CORS
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.id = 'hashconnect-script-direct';
    
    script.onload = () => {
      console.log('HashConnect loaded directly');
      if (typeof window !== 'undefined') {
        window._hashConnectLoaded = true;
        if (window.HashConnect) {
          console.log('HashConnect available after direct load');
          setScriptLoaded(true);
          window.dispatchEvent(new Event('hashconnect-loaded'));
        } else {
          console.error('HashConnect not found on window after direct load');
        }
      }
    };
    
    script.onerror = (e) => {
      console.error('Error loading HashConnect directly:', e);
      
      // Try one more time with another local path
      const backupScript = document.createElement('script');
      backupScript.src = '/js/hashconnect.js'; // Try a different local path
      backupScript.async = true;
      backupScript.id = 'hashconnect-backup-script';
      
      backupScript.onload = () => {
        console.log('HashConnect loaded from backup source');
        if (window.HashConnect) {
          window._hashConnectLoaded = true;
          setScriptLoaded(true);
          window.dispatchEvent(new Event('hashconnect-loaded'));
        }
      };
      
      document.head.appendChild(backupScript);
    };
    
    document.head.appendChild(script);
  };

  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/npm/hashconnect@0.2.3/dist/bundle.js"
        strategy="afterInteractive"
        onLoad={() => {
          console.log('HashConnect loaded from CDN');
          if (typeof window !== 'undefined' && window.HashConnect) {
            setScriptLoaded(true);
            window.dispatchEvent(new Event('hashconnect-loaded'));
          } else {
            console.error('HashConnect not found on window after CDN load');
            loadHashConnectDirectly();
          }
        }}
        onError={() => {
          console.error('Error loading HashConnect from CDN, trying local file');
          loadHashConnectDirectly();
        }}
      />
    </>
  );
} 