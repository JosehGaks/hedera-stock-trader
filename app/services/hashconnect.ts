'use client';

export class HashConnectService {
  private static instance: HashConnectService;
  private hashConnect: any;
  private state: any;
  private pairingData: any;
  private initPromise: Promise<boolean> | null = null;

  private constructor() {
    this.hashConnect = null;
    this.state = null;
    this.pairingData = null;
  }

  static getInstance(): HashConnectService {
    if (!HashConnectService.instance) {
      HashConnectService.instance = new HashConnectService();
    }
    return HashConnectService.instance;
  }

  async waitForHashConnect(timeoutMs = 5000): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if HashConnect is already available
      if (typeof window !== 'undefined' && window.HashConnect) {
        console.log('HashConnect already available on window');
        this.hashConnect = new window.HashConnect();
        resolve();
        return;
      }

      console.log('Waiting for HashConnect to be available...');

      // Function to check for HashConnect
      const checkHashConnect = () => {
        if (typeof window !== 'undefined' && window.HashConnect) {
          console.log('HashConnect found after waiting');
          clearInterval(checkInterval);
          clearTimeout(timeout);
          this.hashConnect = new window.HashConnect();
          resolve();
        }
      };

      // Set up interval to check for HashConnect
      const checkInterval = setInterval(checkHashConnect, 100);

      // Set up timeout
      const timeout = setTimeout(() => {
        clearInterval(checkInterval);
        console.error('Timed out waiting for HashConnect');
        reject(new Error("HashConnect not loaded within timeout period"));
      }, timeoutMs);

      // Listen for the custom event
      if (typeof window !== 'undefined') {
        window.addEventListener('hashconnect-loaded', () => {
          console.log('Received hashconnect-loaded event');
          if (window.HashConnect) {
            clearInterval(checkInterval);
            clearTimeout(timeout);
            this.hashConnect = new window.HashConnect();
            resolve();
          }
        }, { once: true });
      }
    });
  }

  async init(): Promise<boolean> {
    // Use cached promise if already initializing
    if (this.initPromise) {
      return this.initPromise;
    }

    // Create new init promise
    this.initPromise = (async () => {
      try {
        // Wait for HashConnect to be available
        await this.waitForHashConnect();

        if (!this.hashConnect) {
          console.error('HashConnect still not available after waiting');
          throw new Error('HashConnect not available');
        }

        console.log('Initializing HashConnect...');
        this.state = await this.hashConnect.init({
          appMetadata: {
            name: 'Hedera Stock Trader',
            description: 'A decentralized stock trading platform on Hedera',
            icon: 'https://www.hedera.com/logo-capital-hbar-wordmark.png'
          }
        });
        console.log('HashConnect initialized successfully', this.state);
        return true;
      } catch (error) {
        console.error('Failed to initialize HashConnect:', error);
        this.initPromise = null; // Allow retrying
        throw error;
      }
    })();

    return this.initPromise;
  }

  async connect() {
    try {
      // Ensure HashConnect is initialized
      if (!this.state) {
        await this.init();
      }

      if (!this.hashConnect) {
        throw new Error('HashConnect not available');
      }

      console.log('Connecting to HashConnect...');
      const pairingData = await this.hashConnect.connect();
      this.pairingData = pairingData;
      console.log('Connected to HashConnect', pairingData);
      return pairingData;
    } catch (error) {
      console.error('Failed to connect with HashConnect:', error);
      throw error;
    }
  }

  async disconnect() {
    if (!this.hashConnect) {
      throw new Error('HashConnect not available');
    }

    try {
      await this.hashConnect.disconnect();
      this.pairingData = null;
      return true;
    } catch (error) {
      console.error('Failed to disconnect from HashConnect:', error);
      return false;
    }
  }

  isConnected(): boolean {
    return !!this.pairingData;
  }

  getAccountId(): string {
    if (!this.pairingData || !this.pairingData.accountIds || this.pairingData.accountIds.length === 0) {
      throw new Error('No account connected');
    }
    return this.pairingData.accountIds[0];
  }

  async sendTransaction(accountId: string, transaction: any) {
    if (!this.hashConnect) {
      throw new Error('HashConnect not available');
    }

    if (!this.isConnected()) {
      throw new Error('Not connected to HashPack');
    }

    try {
      return await this.hashConnect.sendTransaction(accountId, transaction);
    } catch (error) {
      console.error('Failed to send transaction:', error);
      throw error;
    }
  }
}