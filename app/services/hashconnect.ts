'use client';

declare global {
  interface Window {
    HashConnect: any;
  }
}

export class HashConnectService {
  private static instance: HashConnectService;
  private hashConnect: any = null;
  private isInitialized = false;
  private state: string = 'Disconnected';
  private pairingData: any = null;
  private initPromise: Promise<void> | null = null;

  private constructor() {}

  public static getInstance(): HashConnectService {
    if (!HashConnectService.instance) {
      HashConnectService.instance = new HashConnectService();
    }
    return HashConnectService.instance;
  }

  private waitForHashConnect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') {
        reject(new Error('HashConnect can only be initialized in the browser'));
        return;
      }

      // First check if HashConnect is already available
      if (window.HashConnect) {
        console.log('HashConnect found immediately');
        resolve();
        return;
      }

      console.log('Waiting for HashConnect to be available...');
      let attempts = 0;
      const maxAttempts = 100; // 10 seconds with 100ms interval

      const checkInterval = setInterval(() => {
        attempts++;
        console.log(`Checking for HashConnect (attempt ${attempts}/${maxAttempts})...`);
        
        // Check if the script is loaded
        const script = document.getElementById('hashconnect-script');
        if (!script) {
          console.error('HashConnect script not found in DOM');
          clearInterval(checkInterval);
          reject(new Error('HashConnect script not found. Please refresh the page.'));
          return;
        }

        if (window.HashConnect) {
          console.log('HashConnect found after waiting');
          clearInterval(checkInterval);
          resolve();
        } else if (attempts >= maxAttempts) {
          console.error('HashConnect not found after maximum attempts');
          clearInterval(checkInterval);
          reject(new Error('HashConnect not found. Please make sure HashPack is installed and the page is loaded over HTTPS.'));
        }
      }, 100);
    });
  }

  public async init(): Promise<void> {
    if (this.isInitialized) return;

    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = (async () => {
      try {
        console.log('Starting HashConnect initialization...');
        await this.waitForHashConnect();
        
        // Check if we're running on HTTPS or localhost
        if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
          throw new Error('HashConnect requires HTTPS or localhost to work. Please use HTTPS or run locally.');
        }

        console.log('Creating new HashConnect instance...');
        this.hashConnect = new window.HashConnect();
        
        console.log('Initializing HashConnect...');
        const initData = await this.hashConnect.init();
        
        // Store the pairing data
        this.pairingData = initData.pairingData;
        this.isInitialized = true;
        
        console.log('HashConnect initialized successfully');
      } catch (error) {
        console.error('Failed to initialize HashConnect:', error);
        throw error;
      }
    })();

    return this.initPromise;
  }

  public async connect(): Promise<{ accountIds: string[] }> {
    if (!this.hashConnect) {
      await this.init();
    }

    if (!this.hashConnect) {
      throw new Error('HashConnect not initialized');
    }

    try {
      console.log('Attempting to connect to HashPack...');
      const state = await this.hashConnect.connect();
      this.state = state.connectionState;
      
      if (!state.accountIds || state.accountIds.length === 0) {
        throw new Error('No accounts found in HashPack wallet');
      }
      
      console.log('Successfully connected to HashPack');
      return { accountIds: state.accountIds };
    } catch (error) {
      console.error('Failed to connect to HashPack:', error);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    if (!this.hashConnect) {
      throw new Error('HashConnect not initialized');
    }

    try {
      await this.hashConnect.disconnect();
      this.state = 'Disconnected';
      this.pairingData = null;
      console.log('Successfully disconnected from HashPack');
    } catch (error) {
      console.error('Failed to disconnect from HashPack:', error);
      throw error;
    }
  }

  public isConnected(): boolean {
    return this.state === 'Connected';
  }

  public getAccountIds(): string[] {
    if (!this.hashConnect) {
      throw new Error('HashConnect not initialized');
    }
    return this.hashConnect.pairingData?.accountIds || [];
  }
}