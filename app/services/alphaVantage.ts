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
  Note?: string; // Alpha Vantage may return an error note
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
  private mockData: Map<string, StockQuote> = new Map();

  private constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY || '';
    this.initializeMockData();
  }

  static getInstance(): AlphaVantageService {
    if (!AlphaVantageService.instance) {
      AlphaVantageService.instance = new AlphaVantageService();
    }
    return AlphaVantageService.instance;
  }

  private initializeMockData() {
    // Setup some initial mock data for common stocks
    const currentDate = new Date().toISOString().split('T')[0];
    
    const mockStocks = [
      {
        symbol: 'AAPL',
        price: 175.50,
        open: 173.25,
        high: 176.20,
        low: 172.80,
        volume: 75000000,
        change: 2.25,
        changePercent: 1.3,
        latestTradingDay: currentDate,
        previousClose: 173.25,
      },
      {
        symbol: 'MSFT',
        price: 338.25,
        open: 335.50,
        high: 339.75,
        low: 334.80,
        volume: 25000000,
        change: 2.75,
        changePercent: 0.82,
        latestTradingDay: currentDate,
        previousClose: 335.50,
      },
    ];

    mockStocks.forEach(stock => {
      this.mockData.set(stock.symbol, stock);
    });
  }

  async getStockQuote(symbol: string): Promise<StockQuote | null> {
    try {
      console.log(`Fetching stock quote for ${symbol} with API key ${this.apiKey ? '[SET]' : '[NOT SET]'}`);
      
      if (!this.apiKey) {
        console.warn('Alpha Vantage API key is not set. Using mock data.');
        return this.getMockQuote(symbol);
      }
      
      const response = await fetch(
        `${this.baseUrl}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${this.apiKey}`
      );

      if (!response.ok) {
        console.error(`Failed to fetch stock quote: ${response.status} ${response.statusText}`);
        return this.getMockQuote(symbol);
      }

      const data: AlphaVantageResponse = await response.json();
      
      // Check if Alpha Vantage returned an error message
      if (data.Note) {
        console.warn(`Alpha Vantage API returned a note: ${data.Note}`);
        return this.getMockQuote(symbol);
      }
      
      const quote = data['Global Quote'];

      if (!quote || !quote['05. price']) {
        console.warn(`No quote data found for symbol ${symbol}`);
        return this.getMockQuote(symbol);
      }

      console.log(`Successfully fetched quote for ${symbol}:`, quote['05. price']);
      
      return {
        symbol: quote['01. symbol'],
        price: this.parseNumber(quote['05. price']),
        open: this.parseNumber(quote['02. open']),
        high: this.parseNumber(quote['03. high']),
        low: this.parseNumber(quote['04. low']),
        volume: parseInt(quote['06. volume']) || 0,
        change: this.parseNumber(quote['09. change']),
        changePercent: this.parseNumber(quote['10. change percent'].replace('%', '')),
        latestTradingDay: quote['07. latest trading day'],
        previousClose: this.parseNumber(quote['08. previous close']),
      };
    } catch (error) {
      console.error('Failed to fetch stock quote:', error);
      return this.getMockQuote(symbol);
    }
  }

  private getMockQuote(symbol: string): StockQuote {
    // Return mock data if we have it for this symbol
    if (this.mockData.has(symbol)) {
      console.log(`Returning mock data for ${symbol}`);
      return this.mockData.get(symbol)!;
    }
    
    // Generate random mock data for other symbols
    console.log(`Generating mock data for ${symbol}`);
    const currentDate = new Date().toISOString().split('T')[0];
    const basePrice = 100 + Math.random() * 900;
    const changePercent = (Math.random() * 6) - 3; // -3% to +3%
    const change = basePrice * (changePercent / 100);
    
    return {
      symbol,
      price: basePrice,
      open: basePrice - (Math.random() * 5),
      high: basePrice + (Math.random() * 10),
      low: basePrice - (Math.random() * 10),
      volume: Math.floor(Math.random() * 10000000),
      change,
      changePercent,
      latestTradingDay: currentDate,
      previousClose: basePrice - change,
    };
  }

  private parseNumber(value: string): number {
    if (!value) return 0;
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  }

  async getIntradayData(symbol: string, interval: '1min' | '5min' | '15min' | '30min' | '60min' = '5min') {
    try {
      if (!this.apiKey) {
        console.warn('Alpha Vantage API key is not set. Cannot fetch intraday data.');
        return null;
      }
      
      const response = await fetch(
        `${this.baseUrl}?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=${interval}&apikey=${this.apiKey}`
      );

      if (!response.ok) {
        console.error(`Failed to fetch intraday data: ${response.status} ${response.statusText}`);
        return null;
      }

      const data = await response.json();
      
      if (data.Note) {
        console.warn(`Alpha Vantage API returned a note: ${data.Note}`);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Failed to fetch intraday data:', error);
      return null;
    }
  }
} 