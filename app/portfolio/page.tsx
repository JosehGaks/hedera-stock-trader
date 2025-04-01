'use client';

import React from 'react';
import { PortfolioView } from '../components/portfolio/PortfolioView';

export default function PortfolioPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Portfolio</h1>
      <PortfolioView />
    </div>
  );
} 