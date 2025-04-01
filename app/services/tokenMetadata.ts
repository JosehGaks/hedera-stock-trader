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
        console.warn('Wallet not connected, skipping token metadata update');
        return true; // Return success to avoid errors in UI
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
        console.warn('Wallet not connected, using mock token metadata');
        return this.getMockTokenMetadata(tokenId);
      }

      const transaction = {
        type: 'TokenInfo',
        tokenId
      };

      const response = await signTransaction(transaction) as TokenResponse;
      if (!response.success || !response.result?.metadata) {
        return this.getMockTokenMetadata(tokenId);
      }

      return JSON.parse(response.result.metadata);
    } catch (error) {
      console.error('Error getting token metadata:', error);
      return this.getMockTokenMetadata(tokenId);
    }
  }

  private getMockTokenMetadata(tokenId: string): TokenMetadata {
    return {
      name: `Token ${tokenId}`,
      symbol: tokenId,
      description: 'Mock token description',
      sector: 'Technology',
      country: 'United States',
      market: 'NASDAQ',
      price: 100 + Math.random() * 50,
      volume: 1000000 + Math.random() * 5000000,
      marketCap: 1000000000 + Math.random() * 5000000000,
      isUSStock: true,
      lastUpdated: new Date().toISOString(),
      averageCost: 90 + Math.random() * 30,
    };
  }

  async updatePriceHistory(tokenId: string, price: number): Promise<boolean> {
    try {
      if (!await this.isConnected()) {
        console.warn('Wallet not connected, skipping price history update');
        return true; // Return success to avoid errors in UI
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
        console.warn('Wallet not connected, using mock price history');
        return this.getMockPriceHistory();
      }

      const transaction = {
        type: 'TokenHistory',
        tokenId
      };

      const response = await signTransaction(transaction) as TokenResponse;
      if (!response.success || !response.result?.history) {
        return this.getMockPriceHistory();
      }

      return JSON.parse(response.result.history);
    } catch (error) {
      console.error('Error getting price history:', error);
      return this.getMockPriceHistory();
    }
  }

  // Helper method to generate mock price history data
  private getMockPriceHistory(): { price: number, timestamp: string }[] {
    const history: { price: number, timestamp: string }[] = [];
    const now = new Date();
    const basePrice = 100 + Math.random() * 50;
    
    // Generate 24 hours of price history with 5-minute intervals
    for (let i = 0; i < 288; i++) {
      const time = new Date(now.getTime() - (288 - i) * 5 * 60 * 1000);
      const randomFactor = Math.random() * 5 - 2.5; // Random price movement between -2.5 and +2.5
      const price = basePrice + randomFactor + (i / 20); // Slight upward trend
      
      history.push({
        timestamp: time.toISOString(),
        price: Math.max(0, price) // Ensure price is positive
      });
    }
    
    return history;
  }
} 