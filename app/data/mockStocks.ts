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
    mockPrice: 175.50,
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
    mockPrice: 338.25,
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
  }
]; 