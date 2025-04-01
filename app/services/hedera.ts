import { HashConnectService } from './hashconnect';
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
  private hashConnectService: HashConnectService;

  private constructor() {
    this.hashConnectService = HashConnectService.getInstance();
  }

  static getInstance(): HederaService {
    if (!HederaService.instance) {
      HederaService.instance = new HederaService();
    }
    return HederaService.instance;
  }

  async init(): Promise<boolean> {
    try {
      return await this.hashConnectService.init();
    } catch (error) {
      console.error('Failed to initialize Hedera service:', error);
      return false;
    }
  }

  async connect(): Promise<boolean> {
    try {
      return await this.hashConnectService.connect();
    } catch (error) {
      console.error('Failed to connect to Hedera:', error);
      return false;
    }
  }

  async disconnect(): Promise<boolean> {
    try {
      return await this.hashConnectService.disconnect();
    } catch (error) {
      console.error('Failed to disconnect from Hedera:', error);
      return false;
    }
  }

  isConnected(): boolean {
    return this.hashConnectService.isConnected();
  }

  async transferToken({ tokenId, amount, isBuying }: TokenTransferParams) {
    if (!this.hashConnectService.isConnected()) {
      throw new Error('HashConnect not connected');
    }

    try {
      const accountId = this.hashConnectService.getAccountId();
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
      const response = await this.hashConnectService.sendTransaction(
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
    if (!this.hashConnectService.isConnected()) {
      throw new Error('HashConnect not connected');
    }

    try {
      const accountId = this.hashConnectService.getAccountId();
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
} 