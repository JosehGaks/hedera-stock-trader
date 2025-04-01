import { StockData } from '../types/stock';
import { loadHashConnect, signTransaction } from '@/app/services/hashpack';
import { useAuthStore } from '../store/auth';

interface TokenMetadata {
  name: string;
  symbol: string;
  description: string;
  sector: string;
  country: string;
  market: string;
  price: number;
  volume: number;
  marketCap: number;
  isUSStock: boolean;
  lastUpdated: string;
  averageCost: number;
}

interface TokenResponse {
  success: boolean;
  result?: {
    metadata?: string;
    history?: string;
  };
  error?: unknown;
}

export class TokenMetadataService {
  private static instance: TokenMetadataService;

  private constructor() {}

  public static getInstance(): TokenMetadataService {
    if (!TokenMetadataService.instance) {
      TokenMetadataService.instance = new TokenMetadataService();
    }
    return TokenMetadataService.instance;
  }

  private async isConnected(): Promise<boolean> {
    try {
      const hashConnect = await loadHashConnect();
      return hashConnect.pairingData !== null;
    } catch (error) {
      console.error('Error checking connection:', error);
      return false;
    }
  }

  async updateTokenMetadata(tokenId: string, metadata: TokenMetadata): Promise<boolean> {
    try {
      if (!await this.isConnected()) {
        throw new Error('Wallet not connected');
      }

      const transaction = {
        type: 'TokenUpdate',
        tokenId,
        metadata: JSON.stringify(metadata)
      };

      const response = await signTransaction(transaction) as TokenResponse;
      return response.success;
    } catch (error) {
      console.error('Error updating token metadata:', error);
      return false;
    }
  }

  async getTokenMetadata(tokenId: string): Promise<TokenMetadata | null> {
    try {
      if (!await this.isConnected()) {
        throw new Error('Wallet not connected');
      }

      const transaction = {
        type: 'TokenInfo',
        tokenId
      };

      const response = await signTransaction(transaction) as TokenResponse;
      if (!response.success || !response.result?.metadata) {
        return null;
      }

      return JSON.parse(response.result.metadata);
    } catch (error) {
      console.error('Error getting token metadata:', error);
      return null;
    }
  }

  async updatePriceHistory(tokenId: string, price: number): Promise<boolean> {
    try {
      if (!await this.isConnected()) {
        throw new Error('Wallet not connected');
      }

      const metadata = await this.getTokenMetadata(tokenId);
      if (!metadata) {
        throw new Error('Token metadata not found');
      }

      metadata.price = price;
      metadata.lastUpdated = new Date().toISOString();

      return this.updateTokenMetadata(tokenId, metadata);
    } catch (error) {
      console.error('Error updating price history:', error);
      return false;
    }
  }

  async getPriceHistory(tokenId: string): Promise<{ price: number, timestamp: string }[]> {
    try {
      if (!await this.isConnected()) {
        throw new Error('Wallet not connected');
      }

      const transaction = {
        type: 'TokenHistory',
        tokenId
      };

      const response = await signTransaction(transaction) as TokenResponse;
      if (!response.success || !response.result?.history) {
        return [];
      }

      return JSON.parse(response.result.history);
    } catch (error) {
      console.error('Error getting price history:', error);
      return [];
    }
  }
} 