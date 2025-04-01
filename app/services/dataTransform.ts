import { StockData, StockQuote } from '../types/stock';

export class DataTransformService {
  private static instance: DataTransformService;

  private constructor() {}

  public static getInstance(): DataTransformService {
    if (!DataTransformService.instance) {
      DataTransformService.instance = new DataTransformService();
    }
    return DataTransformService.instance;
  }

  public transformStockQuote(symbol: string, quoteData: StockQuote): StockData {
    return {
      tokenId: symbol,
      name: symbol,
      description: '',
      logo: '',
      sector: '',
      country: 'US',
      market: 'NYSE',
      mockPrice: quoteData.price,
      priceHistory: [],
      marketCap: 0,
      volume24h: quoteData.volume,
      isUSStock: true,
      price: quoteData.price,
      volume: quoteData.volume,
      change: quoteData.change,
      changePercent: quoteData.changePercent,
      open: quoteData.open,
      high: quoteData.high,
      low: quoteData.low,
      latestTradingDay: quoteData.latestTradingDay,
      previousClose: quoteData.previousClose,
    };
  }

  private parseNumber(value: string): number {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  }
} 