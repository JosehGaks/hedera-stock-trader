import { TokenId } from '@hashgraph/sdk';
import { AlphaVantageService } from './alphaVantage';

interface PriceData {
  tokenId: string;
  price: number;
  timestamp: string;
  volume24h: number;
  change24h: number;
}

interface MirrorNodeResponse {
  transactions: Array<{
    consensus_timestamp: string;
    transfers: Array<{
      account: string;
      amount: string;
      token_id: string;
    }>;
  }>;
}

export class PriceService {
  private static instance: PriceService;
  private mirrorNodeUrl: string;
  private priceCache: Map<string, PriceData> = new Map();
  private updateInterval: NodeJS.Timeout | null = null;
  private alphaVantageService: AlphaVantageService;

  private constructor() {
    this.mirrorNodeUrl = process.env.NEXT_PUBLIC_HEDERA_MIRRON_NODE_URL || 'https://mainnet-public.mirrornode.hedera.com';
    this.alphaVantageService = AlphaVantageService.getInstance();
  }

  static getInstance(): PriceService {
    if (!PriceService.instance) {
      PriceService.instance = new PriceService();
    }
    return PriceService.instance;
  }

  async startPriceUpdates() {
    if (this.updateInterval) return;

    // Update prices every 30 seconds
    this.updateInterval = setInterval(() => {
      this.updatePrices();
    }, 30000);

    // Initial price update
    await this.updatePrices();
  }

  stopPriceUpdates() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  private async updatePrices() {
    try {
      // Fetch recent transactions for each token
      const tokenIds = Array.from(this.priceCache.keys());
      if (tokenIds.length === 0) {
        // If no tokens are being tracked, use mock data
        this.updateMockPrices();
        return;
      }

      for (const tokenId of tokenIds) {
        const price = await this.fetchTokenPrice(tokenId);
        if (price) {
          this.priceCache.set(tokenId, price);
        }
      }
    } catch (error) {
      console.error('Failed to update prices:', error);
      // Fallback to mock data if the API call fails
      this.updateMockPrices();
    }
  }

  private async fetchTokenPrice(tokenId: string): Promise<PriceData | null> {
    try {
      // Get the stock data from our API to determine if it's a US stock
      const response = await fetch('/api/stocks');
      if (!response.ok) {
        throw new Error('Failed to fetch stock data');
      }

      const stocks = await response.json();
      const stock = stocks.find((s: any) => s.tokenId === tokenId);

      if (!stock) {
        return null;
      }

      if (stock.isUSStock) {
        // Use Alpha Vantage for US stocks
        const quote = await this.alphaVantageService.getStockQuote(stock.symbol);
        if (!quote) {
          return null;
        }

        return {
          tokenId,
          price: quote.price,
          timestamp: quote.latestTradingDay,
          volume24h: quote.volume,
          change24h: quote.changePercent,
        };
      } else {
        // Use Hedera Mirror Node for African stocks
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);
        const timestamp = oneDayAgo.toISOString();

        const response = await fetch(
          `${this.mirrorNodeUrl}/api/v1/transactions?timestamp=gte:${timestamp}&token_id=${tokenId}`
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch transactions: ${response.statusText}`);
        }

        const data: MirrorNodeResponse = await response.json();
        
        if (!data.transactions || data.transactions.length === 0) {
          return null;
        }

        // Calculate price based on the most recent transaction
        const latestTransaction = data.transactions[0];
        const transfers = latestTransaction.transfers;
        
        // Find the transfer that involves the token
        const tokenTransfer = transfers.find(t => t.token_id === tokenId);
        if (!tokenTransfer) {
          return null;
        }

        // Calculate 24h volume and price change
        const volume24h = this.calculate24hVolume(data.transactions);
        const priceChange = this.calculate24hPriceChange(data.transactions);

        return {
          tokenId,
          price: parseFloat(tokenTransfer.amount),
          timestamp: latestTransaction.consensus_timestamp,
          volume24h,
          change24h: priceChange,
        };
      }
    } catch (error) {
      console.error(`Failed to fetch price for token ${tokenId}:`, error);
      return null;
    }
  }

  private calculate24hVolume(transactions: MirrorNodeResponse['transactions']): number {
    return transactions.reduce((total, tx) => {
      return total + tx.transfers.reduce((txTotal, transfer) => {
        return txTotal + Math.abs(parseFloat(transfer.amount));
      }, 0);
    }, 0);
  }

  private calculate24hPriceChange(transactions: MirrorNodeResponse['transactions']): number {
    if (transactions.length < 2) return 0;

    const latestPrice = parseFloat(transactions[0].transfers[0].amount);
    const oldestPrice = parseFloat(transactions[transactions.length - 1].transfers[0].amount);
    
    return ((latestPrice - oldestPrice) / oldestPrice) * 100;
  }

  private updateMockPrices() {
    // Fallback to mock data when API calls fail
    const mockPrices: PriceData[] = [
      {
        tokenId: '0.0.123456',
        price: 25.50,
        timestamp: new Date().toISOString(),
        volume24h: 1000000,
        change24h: 2.5,
      },
      {
        tokenId: '0.0.789012',
        price: 15.75,
        timestamp: new Date().toISOString(),
        volume24h: 750000,
        change24h: -1.2,
      },
    ];

    mockPrices.forEach(price => {
      this.priceCache.set(price.tokenId, price);
    });
  }

  getPrice(tokenId: string): PriceData | null {
    return this.priceCache.get(tokenId) || null;
  }

  getAllPrices(): PriceData[] {
    return Array.from(this.priceCache.values());
  }
} 