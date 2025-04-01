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
    if (!quoteData) {
      throw new Error('Quote data is null or undefined');
    }
    
    // Set default values for required fields
    const price = quoteData.price || 0;
    const change = quoteData.change || 0;
    const changePercent = quoteData.changePercent || 0;
    const volume = quoteData.volume || 0;
    
    return {
      tokenId: symbol,
      name: symbol,
      description: '',
      logo: '',
      sector: '',
      country: 'US',
      market: 'NYSE',
      mockPrice: price,
      priceHistory: [],
      marketCap: 0,
      volume24h: volume,
      isUSStock: true,
      price: price,
      volume: volume,
      change: change,
      changePercent: changePercent,
      open: quoteData.open || price,
      high: quoteData.high || price,
      low: quoteData.low || price,
      latestTradingDay: quoteData.latestTradingDay || new Date().toISOString().split('T')[0],
      previousClose: quoteData.previousClose || price,
    };
  }

  private parseNumber(value: string): number {
    if (!value) return 0;
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  }
} 