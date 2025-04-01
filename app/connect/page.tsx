'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/app/store/auth';
import { HashConnectService } from '@/app/services/hashconnect';

export default function ConnectPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isHashPackInstalled, setIsHashPackInstalled] = useState<boolean | null>(null);
  const [isHttps, setIsHttps] = useState<boolean>(false);

  useEffect(() => {
    // Check if we're running on HTTPS or localhost
    const isSecure = window.location.protocol === 'https:' || window.location.hostname === 'localhost';
    setIsHttps(isSecure);

    const checkHashPack = async () => {
      try {
        const hashConnect = HashConnectService.getInstance();
        await hashConnect.init();
        setIsHashPackInstalled(true);
      } catch (error) {
        console.error('Error checking HashPack:', error);
        setIsHashPackInstalled(false);
      }
    };

    if (isSecure) {
      checkHashPack();
    }
  }, []);

  const handleConnect = async () => {
    try {
      setLoading(true);
      setError(null);

      const hashConnect = HashConnectService.getInstance();
      const { accountIds } = await hashConnect.connect();

      if (accountIds && accountIds.length > 0) {
        setUser({
          accountId: accountIds[0],
          publicKey: '', // We'll get this from the wallet later
        });
        router.push('/dashboard');
      } else {
        setError('No account found in HashPack wallet');
      }
    } catch (error) {
      console.error('Connection error:', error);
      setError(error instanceof Error ? error.message : 'Failed to connect wallet');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8 bg-gray-800 p-8 rounded-xl shadow-2xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-2">Connect Your Wallet</h2>
          <p className="text-gray-400">Connect your HashPack wallet to start trading</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {!isHttps && (
          <div className="bg-yellow-500/10 border border-yellow-500 text-yellow-500 px-4 py-3 rounded-lg">
            HashConnect requires HTTPS or localhost to work. Please use HTTPS or run locally.
          </div>
        )}

        {isHashPackInstalled === false && (
          <div className="bg-yellow-500/10 border border-yellow-500 text-yellow-500 px-4 py-3 rounded-lg">
            HashPack extension not found. Please install it from{' '}
            <a
              href="https://hashpack.app"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              hashpack.app
            </a>
          </div>
        )}

        <button
          onClick={handleConnect}
          disabled={loading || isHashPackInstalled === false || !isHttps}
          className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-all duration-200 ${
            loading || isHashPackInstalled === false || !isHttps
              ? 'bg-gray-600 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {loading ? 'Connecting...' : 'Connect HashPack Wallet'}
        </button>

        <div className="text-center text-sm text-gray-400">
          <p>Don't have HashPack?</p>
          <a
            href="https://hashpack.app"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300"
          >
            Install HashPack Extension
          </a>
        </div>
      </div>
    </div>
  );
} 