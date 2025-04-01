'use client';

import React, { useEffect, useRef } from 'react';

interface DefaultImageCreatorProps {
  symbol: string;
  backgroundColor?: string;
  textColor?: string;
}

export default function DefaultImageCreator({ 
  symbol, 
  backgroundColor = '#3B82F6', 
  textColor = '#FFFFFF' 
}: DefaultImageCreatorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas size (512x512 for good quality)
    canvas.width = 512;
    canvas.height = 512;
    
    // Draw background
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw text
    ctx.fillStyle = textColor;
    ctx.font = 'bold 200px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Get first 2 characters of symbol
    const displayText = symbol.substring(0, 2).toUpperCase();
    ctx.fillText(displayText, canvas.width / 2, canvas.height / 2);
    
    // Optional: Add subtle inner shadow for depth
    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
    ctx.shadowBlur = 15;
    ctx.shadowOffsetX = 5;
    ctx.shadowOffsetY = 5;
  }, [symbol, backgroundColor, textColor]);
  
  const downloadImage = () => {
    if (!canvasRef.current) return;
    
    // Convert canvas to data URL
    const dataUrl = canvasRef.current.toDataURL('image/png');
    
    // Create download link
    const link = document.createElement('a');
    link.download = `${symbol.toLowerCase()}.png`;
    link.href = dataUrl;
    link.click();
  };
  
  return (
    <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow">
      <h3 className="mb-4 text-lg font-medium">Stock Image Generator</h3>
      <canvas 
        ref={canvasRef} 
        className="w-64 h-64 rounded-lg shadow-md mb-4"
      ></canvas>
      <div className="flex space-x-4">
        <button
          onClick={downloadImage}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Download {symbol}.png
        </button>
        <p className="text-sm text-gray-600">
          Save to /public/images/stocks/
        </p>
      </div>
    </div>
  );
} 