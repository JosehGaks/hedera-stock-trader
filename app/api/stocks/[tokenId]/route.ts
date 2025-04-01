import { NextResponse } from 'next/server';
import { mockStocks } from '@/app/data/mockStocks';

export async function GET(
  request: Request,
  { params }: { params: { tokenId: string } }
) {
  try {
    const { tokenId } = params;
    
    // Find the stock by tokenId or symbol (case insensitive)
    const stock = mockStocks.find(
      (s) => 
        s.tokenId === tokenId || 
        s.symbol === tokenId ||
        s.symbol.toLowerCase() === tokenId.toLowerCase()
    );
    
    if (!stock) {
      return NextResponse.json(
        { error: `Stock with ID ${tokenId} not found` },
        { status: 404 }
      );
    }
    
    return NextResponse.json(stock);
  } catch (error) {
    console.error(`Error fetching stock ${params.tokenId}:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch stock details' },
      { status: 500 }
    );
  }
} 