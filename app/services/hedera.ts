import { HashConnect, HashConnectConnectionState, SessionData } from 'hashconnect';
import { LedgerId, AccountId, TokenId, TransferTransaction, TransactionReceipt } from '@hashgraph/sdk';

interface TokenTransferParams {
  tokenId: string;
  amount: number;
  isBuying: boolean;
}

declare global {
  interface Window {
    hashpack: any;
  }
}

export class HederaService {
  private static instance: HederaService;
  private hashConnect: HashConnect | null = null;
  private isInitialized = false;
  private state: HashConnectConnectionState = HashConnectConnectionState.Disconnected;
  private pairingData: SessionData | null = null;

  private constructor() {}

  static getInstance(): HederaService {
    if (!HederaService.instance) {
      HederaService.instance = new HederaService();
    }
    return HederaService.instance;
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      const appMetadata = {
        name: "AfriStocks",
        description: "Trade tokenized African stocks on the Hedera blockchain",
        icons: ["https://afristocks.com/logo.png"],
        url: "https://afristocks.com"
      };

      // Create HashConnect instance
      this.hashConnect = new HashConnect(
        LedgerId.MAINNET,
        process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || '',
        appMetadata,
        true
      );

      // Set up event listeners
      this.setUpHashConnectEvents();

      // Initialize HashConnect
      await this.hashConnect.init();

      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize HashConnect:', error);
      throw error;
    }
  }

  private setUpHashConnectEvents() {
    if (!this.hashConnect) return;

    this.hashConnect.pairingEvent.on((newPairing) => {
      this.pairingData = newPairing;
    });

    this.hashConnect.disconnectionEvent.on(() => {
      this.pairingData = null;
    });

    this.hashConnect.connectionStatusChangeEvent.on((connectionStatus) => {
      this.state = connectionStatus;
    });
  }

  async connectWallet() {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (!this.hashConnect) {
      throw new Error('HashConnect not initialized');
    }

    try {
      // Open the pairing modal
      this.hashConnect.openPairingModal();
      
      // Wait for pairing to complete
      return new Promise<SessionData>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Pairing timeout'));
        }, 30000); // 30 second timeout

        this.hashConnect!.pairingEvent.once((pairingData) => {
          clearTimeout(timeout);
          resolve(pairingData);
        });
      });
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
  }

  async transferToken({ tokenId, amount, isBuying }: TokenTransferParams) {
    if (!this.isInitialized || !this.hashConnect || !this.pairingData) {
      throw new Error('HashConnect not initialized or not connected');
    }

    try {
      const accountId = this.pairingData.accountIds[0];
      const tokenIdObj = TokenId.fromString(tokenId);
      const treasuryAccountId = AccountId.fromString(process.env.NEXT_PUBLIC_HEDERA_ACCOUNT_ID || '');

      // Create the transfer transaction
      const transaction = new TransferTransaction()
        .addTokenTransfer(
          tokenIdObj,
          AccountId.fromString(accountId),
          isBuying ? amount : -amount
        )
        .addTokenTransfer(
          tokenIdObj,
          treasuryAccountId,
          isBuying ? -amount : amount
        )
        .freeze();

      // Send the transaction for signing
      const response = await this.hashConnect.sendTransaction(
        accountId,
        transaction
      );

      return {
        success: true,
        transactionId: response.toString(),
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Token transfer failed:', error);
      throw error;
    }
  }

  async getTokenBalance(tokenId: string) {
    if (!this.isInitialized || !this.hashConnect || !this.pairingData) {
      throw new Error('HashConnect not initialized or not connected');
    }

    try {
      const accountId = this.pairingData.accountIds[0];
      const mirrorNodeUrl = process.env.NEXT_PUBLIC_HEDERA_MIRRON_NODE_URL || 'https://mainnet-public.mirrornode.hedera.com';

      const response = await fetch(
        `${mirrorNodeUrl}/api/v1/accounts/${accountId}/tokens?token_id=${tokenId}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch token balance: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.tokens || data.tokens.length === 0) {
        return 0;
      }

      return parseInt(data.tokens[0].balance);
    } catch (error) {
      console.error('Failed to get token balance:', error);
      throw error;
    }
  }

  async disconnect() {
    if (this.hashConnect) {
      await this.hashConnect.disconnect();
      this.pairingData = null;
      this.state = HashConnectConnectionState.Disconnected;
    }
  }
} 