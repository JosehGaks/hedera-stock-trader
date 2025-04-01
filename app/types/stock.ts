export interface Stock {
  tokenId: string;
  name: string;
  symbol: string;
  description: string;
  logo: string;
  sector: string;
  country: 'US' | 'ZA' | 'NG' | 'KE' | 'EG' | 'MA';
  market: 'NYSE' | 'NASDAQ' | 'JSE' | 'NGX' | 'NSE' | 'EGX' | 'CSE';
  mockPrice: number;
  priceHistory: PricePoint[];
  marketCap: number;
  volume24h: number;
  isUSStock: boolean;
}

export interface PricePoint {
  timestamp: string;
  price: number;
  volume: number;
}

export interface StockOffer {
  id: string;
  stockId: string;
  price: number;
  amount: number;
  type: 'buy' | 'sell';
  userId: string;
  timestamp: string;
  status: 'open' | 'filled' | 'cancelled';
}

export interface StockQuote {
  symbol: string;
  price: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  change: number;
  changePercent: number;
  latestTradingDay: string;
  previousClose: number;
}

export interface StockData {
  tokenId: string;
  name: string;
  description: string;
  logo: string;
  sector: string;
  country: 'US' | 'ZA' | 'NG' | 'KE' | 'EG' | 'MA';
  market: 'NYSE' | 'NASDAQ' | 'JSE' | 'NGX' | 'NSE' | 'EGX' | 'CSE';
  mockPrice: number;
  priceHistory: PricePoint[];
  marketCap: number;
  volume24h: number;
  isUSStock: boolean;
  price: number;
  volume: number;
  change: number;
  changePercent: number;
  open: number;
  high: number;
  low: number;
  latestTradingDay: string;
  previousClose: number;
}

export interface TokenMetadata {
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