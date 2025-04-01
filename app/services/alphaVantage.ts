interface AlphaVantageResponse {
  'Global Quote': {
    '01. symbol': string;
    '02. open': string;
    '03. high': string;
    '04. low': string;
    '05. price': string;
    '06. volume': string;
    '07. latest trading day': string;
    '08. previous close': string;
    '09. change': string;
    '10. change percent': string;
  };
}

interface StockQuote {
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

export class AlphaVantageService {
  private static instance: AlphaVantageService;
  private apiKey: string;
  private baseUrl: string = 'https://www.alphavantage.co/query';

  private constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY || '';
  }

  static getInstance(): AlphaVantageService {
    if (!AlphaVantageService.instance) {
      AlphaVantageService.instance = new AlphaVantageService();
    }
    return AlphaVantageService.instance;
  }

  async getStockQuote(symbol: string): Promise<StockQuote | null> {
    try {
      const response = await fetch(
        `${this.baseUrl}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${this.apiKey}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch stock quote: ${response.statusText}`);
      }

      const data: AlphaVantageResponse = await response.json();
      const quote = data['Global Quote'];

      if (!quote || !quote['05. price']) {
        return null;
      }

      return {
        symbol: quote['01. symbol'],
        price: parseFloat(quote['05. price']),
        open: parseFloat(quote['02. open']),
        high: parseFloat(quote['03. high']),
        low: parseFloat(quote['04. low']),
        volume: parseInt(quote['06. volume']),
        change: parseFloat(quote['09. change']),
        changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
        latestTradingDay: quote['07. latest trading day'],
        previousClose: parseFloat(quote['08. previous close']),
      };
    } catch (error) {
      console.error('Failed to fetch stock quote:', error);
      return null;
    }
  }

  async getIntradayData(symbol: string, interval: '1min' | '5min' | '15min' | '30min' | '60min' = '5min') {
    try {
      const response = await fetch(
        `${this.baseUrl}?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=${interval}&apikey=${this.apiKey}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch intraday data: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to fetch intraday data:', error);
      return null;
    }
  }
} 