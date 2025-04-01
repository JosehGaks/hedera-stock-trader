import { Stock } from '@/app/types/stock';

export const mockStocks: Stock[] = [
  {
    tokenId: '0.0.123456',
    name: 'Apple Inc.',
    symbol: 'AAPL',
    description: 'Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide.',
    logo: 'https://logo.clearbit.com/apple.com',
    sector: 'Technology',
    country: 'US',
    market: 'NASDAQ',
    mockPrice: 175.23,
    priceHistory: [],
    marketCap: 2800000000000,
    volume24h: 75000000,
    isUSStock: true
  },
  {
    tokenId: '0.0.123457',
    name: 'Microsoft Corporation',
    symbol: 'MSFT',
    description: 'Microsoft Corporation develops, licenses, and supports software, services, devices, and solutions worldwide.',
    logo: 'https://logo.clearbit.com/microsoft.com',
    sector: 'Technology',
    country: 'US',
    market: 'NASDAQ',
    mockPrice: 383.28,
    priceHistory: [],
    marketCap: 2500000000000,
    volume24h: 25000000,
    isUSStock: true
  },
  {
    tokenId: '0.0.123458',
    name: 'Amazon.com Inc.',
    symbol: 'AMZN',
    description: 'Amazon.com Inc. engages in the retail sale of consumer products and subscriptions in North America and internationally.',
    logo: 'https://logo.clearbit.com/amazon.com',
    sector: 'Consumer Discretionary',
    country: 'US',
    market: 'NASDAQ',
    mockPrice: 145.75,
    priceHistory: [],
    marketCap: 1500000000000,
    volume24h: 45000000,
    isUSStock: true
  },
  {
    tokenId: '0.0.123459',
    name: 'Tesla, Inc.',
    symbol: 'TSLA',
    description: 'Tesla, Inc. designs, develops, manufactures, leases, and sells electric vehicles, and energy generation and storage systems.',
    sector: 'Automotive',
    country: 'US',
    market: 'NASDAQ',
    logo: 'https://logo.clearbit.com/tesla.com',
    mockPrice: 216.42,
    priceHistory: [],
    marketCap: 687000000000,
    volume24h: 94000000,
    isUSStock: true
  },
  {
    tokenId: '0.0.123460',
    name: 'Safaricom Plc',
    symbol: 'SAFCOM',
    description: 'Safaricom PLC is a mobile network operator headquartered in Kenya. It is the largest telecommunications provider in Kenya.',
    sector: 'Telecommunications',
    country: 'KE',
    market: 'NSE',
    logo: 'https://logo.clearbit.com/safaricom.co.ke',
    mockPrice: 25.75,
    priceHistory: [],
    marketCap: 1032000000,
    volume24h: 1500000,
    isUSStock: false
  }
]; 