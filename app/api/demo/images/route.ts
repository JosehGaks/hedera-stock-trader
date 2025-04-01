import { NextResponse } from 'next/server';

export async function GET() {
  // This function logs a message to console and instructs the user to add default images
  console.log('Demo API: Please ensure you have default stock images in the public/images/stocks directory');
  console.log('Add default.png for fallback image and individual stock logos as needed');
  
  return NextResponse.json({
    message: 'For the demo, please add the following files to your public/images/stocks directory:',
    requiredImages: [
      'default.png',
      'aapl.png',
      'msft.png',
      'amzn.png',
      'tsla.png',
      'safcom.png'
    ]
  });
} 