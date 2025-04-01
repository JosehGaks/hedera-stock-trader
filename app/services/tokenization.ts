import { StockData } from '../types/stock';
import { loadHashConnect, signTransaction } from './hashpack';
import { useAuthStore } from '../store/auth';

export class TokenizationService {
  private static instance: TokenizationService;

  private constructor() {}

  public static getInstance(): TokenizationService {
    if (!TokenizationService.instance) {
      TokenizationService.instance = new TokenizationService();
    }
    return TokenizationService.instance;
  }

  public isConnected(): boolean {
    return useAuthStore.getState().user !== null;
  }

  public async tokenizeStock(stockData: StockData): Promise<{ success: boolean; tokenId?: string; error?: string }> {
    try {
      // Check if wallet is connected
      if (!this.isConnected()) {
        return { success: false, error: 'Wallet not connected' };
      }

      // Check if we're in a valid trading phase
      const tradingPhaseService = (await import('./tradingPhase')).TradingPhaseService.getInstance();
      if (!tradingPhaseService.isTradingAllowed()) {
        return { success: false, error: 'Trading not allowed in current market phase' };
      }

      // Create token metadata
      const tokenMetadata = {
        name: stockData.name,
        symbol: stockData.tokenId, // Using tokenId as symbol since it's the stock symbol
        description: stockData.description,
        sector: stockData.sector,
        country: stockData.country,
        market: stockData.market,
        price: stockData.price,
        volume: stockData.volume,
        marketCap: stockData.marketCap,
        isUSStock: stockData.isUSStock,
      };

      // Create token on Hedera
      const hashConnect = loadHashConnect();
      if (!hashConnect) {
        return { success: false, error: 'HashConnect not initialized' };
      }

      // Create token transaction
      const transaction = {
        type: 'CREATE_TOKEN',
        metadata: tokenMetadata,
      };

      const result = await signTransaction(transaction);
      if (!result.success) {
        return { success: false, error: 'Failed to create token' };
      }

      return { success: true, tokenId: result.result.tokenId };
    } catch (error) {
      console.error('Error tokenizing stock:', error);
      return { success: false, error: 'Failed to tokenize stock' };
    }
  }

  public async getTokenBalance(tokenId: string): Promise<number> {
    try {
      if (!this.isConnected()) {
        return 0;
      }

      const hashConnect = loadHashConnect();
      if (!hashConnect) {
        return 0;
      }

      // Get token balance transaction
      const transaction = {
        type: 'GET_TOKEN_BALANCE',
        tokenId,
      };

      const result = await signTransaction(transaction);
      if (!result.success) {
        return 0;
      }

      return result.result.balance;
    } catch (error) {
      console.error('Error getting token balance:', error);
      return 0;
    }
  }

  public async transferTokens(tokenId: string, to: string, amount: number): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.isConnected()) {
        return { success: false, error: 'Wallet not connected' };
      }

      const hashConnect = loadHashConnect();
      if (!hashConnect) {
        return { success: false, error: 'HashConnect not initialized' };
      }

      // Transfer tokens transaction
      const transaction = {
        type: 'TRANSFER_TOKENS',
        tokenId,
        to,
        amount,
      };

      const result = await signTransaction(transaction);
      if (!result.success) {
        return { success: false, error: 'Failed to transfer tokens' };
      }

      return { success: true };
    } catch (error) {
      console.error('Error transferring tokens:', error);
      return { success: false, error: 'Failed to transfer tokens' };
    }
  }
} 