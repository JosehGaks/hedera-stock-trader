import { NextResponse } from 'next/server';
import { Stock } from '@/app/types/stock';

// Sample stock data
const stocks: Stock[] = [
  // US Stocks
  {
    tokenId: '0.0.123456',
    name: 'Apple Inc.',
    symbol: 'AAPL',
    description: 'Technology company that designs, manufactures, and markets mobile communication and media devices.',
    logo: '/images/stocks/apple.png',
    sector: 'Technology',
    country: 'US',
    market: 'NASDAQ',
    mockPrice: 175.50,
    marketCap: 2800000000000,
    volume24h: 75000000,
    isUSStock: true,
    priceHistory: [
      {
        timestamp: new Date().toISOString(),
        price: 175.50,
        volume: 75000000,
      },
    ],
  },
  {
    tokenId: '0.0.123457',
    name: 'Microsoft Corporation',
    symbol: 'MSFT',
    description: 'Technology company that develops, licenses, and supports software products, services, and devices.',
    logo: '/images/stocks/microsoft.png',
    sector: 'Technology',
    country: 'US',
    market: 'NASDAQ',
    mockPrice: 338.25,
    marketCap: 2510000000000,
    volume24h: 25000000,
    isUSStock: true,
    priceHistory: [
      {
        timestamp: new Date().toISOString(),
        price: 338.25,
        volume: 25000000,
      },
    ],
  },
  // African Stocks
  {
    tokenId: '0.0.123458',
    name: 'Safaricom PLC',
    symbol: 'SCOM',
    description: 'Leading telecommunications company in Kenya.',
    logo: '/images/stocks/safaricom.png',
    sector: 'Telecommunications',
    country: 'KE',
    market: 'NSE',
    mockPrice: 25.50,
    marketCap: 12000000000,
    volume24h: 1500000,
    isUSStock: false,
    priceHistory: [
      {
        timestamp: new Date().toISOString(),
        price: 25.50,
        volume: 1500000,
      },
    ],
  },
  {
    tokenId: '0.0.123459',
    name: 'MTN Group Limited',
    symbol: 'MTN',
    description: 'Leading telecommunications company in Africa.',
    logo: '/images/stocks/mtn.png',
    sector: 'Telecommunications',
    country: 'ZA',
    market: 'JSE',
    mockPrice: 15.75,
    marketCap: 25000000000,
    volume24h: 3000000,
    isUSStock: false,
    priceHistory: [
      {
        timestamp: new Date().toISOString(),
        price: 15.75,
        volume: 3000000,
      },
    ],
  },
];

export async function GET() {
  try {
    // In a real application, this would fetch from a database
    return NextResponse.json(stocks);
  } catch (error) {
    console.error('Failed to fetch stocks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stocks' },
      { status: 500 }
    );
  }
} 