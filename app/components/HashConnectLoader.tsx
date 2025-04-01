'use client';

import { useEffect, useState } from 'react';

export default function HashConnectLoader() {
  const [loading, setLoading] = useState(true);
  const [loadingText, setLoadingText] = useState('Initializing HashConnect...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkHashConnect = () => {
      if (typeof window !== 'undefined' && window.HashConnect) {
        console.log('HashConnectLoader: HashConnect found on window');
        setLoading(false);
        return true;
      }
      return false;
    };

    // Check immediately
    if (checkHashConnect()) {
      return;
    }

    // Define loading messages
    const loadingMessages = [
      'Initializing HashConnect...',
      'Loading wallet connection...',
      'Preparing HashConnect...',
      'Almost there...',
      'This is taking longer than expected...',
    ];

    // Update loading text every 2 seconds
    let messageIndex = 0;
    const messageInterval = setInterval(() => {
      messageIndex = (messageIndex + 1) % loadingMessages.length;
      setLoadingText(loadingMessages[messageIndex]);
    }, 2000);

    // Check for HashConnect every 500ms
    const checkInterval = setInterval(() => {
      if (checkHashConnect()) {
        clearInterval(checkInterval);
        clearInterval(messageInterval);
      }
    }, 500);

    // Set timeout after 10 seconds
    const timeout = setTimeout(() => {
      if (!checkHashConnect()) {
        setError('HashConnect could not be loaded. Please refresh the page or ensure HashPack extension is installed.');
        clearInterval(checkInterval);
        clearInterval(messageInterval);
      }
    }, 10000);

    return () => {
      clearInterval(checkInterval);
      clearInterval(messageInterval);
      clearTimeout(timeout);
    };
  }, []);

  if (!loading && !error) {
    return null; // Don't show anything when loaded successfully
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md mx-auto text-center">
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-700">{loadingText}</p>
          </>
        ) : (
          <>
            <div className="text-red-500 text-lg mb-4">Error</div>
            <p className="text-gray-700 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Refresh Page
            </button>
          </>
        )}
      </div>
    </div>
  );
} 