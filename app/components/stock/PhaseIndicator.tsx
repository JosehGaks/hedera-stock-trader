import React from 'react';

export type TradingPhase = 'pre-market' | 'market-open' | 'market-closed' | 'post-market';

interface PhaseIndicatorProps {
  phase: TradingPhase;
  currentTime: Date;
}

export function PhaseIndicator({ phase, currentTime }: PhaseIndicatorProps) {
  const getPhaseColor = (phase: TradingPhase) => {
    switch (phase) {
      case 'pre-market':
        return 'bg-yellow-100 text-yellow-800';
      case 'market-open':
        return 'bg-green-100 text-green-800';
      case 'market-closed':
        return 'bg-red-100 text-red-800';
      case 'post-market':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPhaseLabel = (phase: TradingPhase) => {
    switch (phase) {
      case 'pre-market':
        return 'Pre-Market';
      case 'market-open':
        return 'Market Open';
      case 'market-closed':
        return 'Market Closed';
      case 'post-market':
        return 'After Hours';
      default:
        return 'Unknown';
    }
  };

  const getPhaseDescription = (phase: TradingPhase) => {
    switch (phase) {
      case 'pre-market':
        return 'Trading available from 4:00 AM to 9:30 AM EST';
      case 'market-open':
        return 'Regular market hours: 9:30 AM to 4:00 PM EST';
      case 'market-closed':
        return 'Market is closed for the day';
      case 'post-market':
        return 'After-hours trading available from 4:00 PM to 8:00 PM EST';
      default:
        return '';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold">Market Phase</h3>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPhaseColor(phase)}`}>
          {getPhaseLabel(phase)}
        </span>
      </div>
      <p className="text-sm text-gray-600">{getPhaseDescription(phase)}</p>
      <div className="mt-2 text-sm text-gray-500">
        Current Time: {currentTime.toLocaleTimeString('en-US', { timeZone: 'America/New_York' })} EST
      </div>
    </div>
  );
} 