import { NextResponse } from 'next/server';
import { mockStocks } from '@/app/data/mockStocks';

export async function GET() {
  try {
    // Return the mock stocks data
    return NextResponse.json(mockStocks);
  } catch (error) {
    console.error('Error fetching stocks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stocks' },
      { status: 500 }
    );
  }
} 