import { TradingPhase } from '../components/stock/PhaseIndicator';

export class TradingPhaseService {
  private static instance: TradingPhaseService;
  private readonly marketOpenHour = 9;
  private readonly marketOpenMinute = 30;
  private readonly marketCloseHour = 16;
  private readonly marketCloseMinute = 0;
  private readonly preMarketStartHour = 4;
  private readonly preMarketStartMinute = 0;
  private readonly postMarketEndHour = 20;
  private readonly postMarketEndMinute = 0;

  private constructor() {}

  public static getInstance(): TradingPhaseService {
    if (!TradingPhaseService.instance) {
      TradingPhaseService.instance = new TradingPhaseService();
    }
    return TradingPhaseService.instance;
  }

  public getCurrentPhase(): TradingPhase {
    const now = new Date();
    const day = now.getDay();
    const hour = now.getHours();
    const minute = now.getMinutes();

    // Check if it's a weekend
    if (day === 0 || day === 6) {
      return 'market-closed';
    }

    // Convert current time to minutes for easier comparison
    const currentTimeInMinutes = hour * 60 + minute;
    const marketOpenInMinutes = this.marketOpenHour * 60 + this.marketOpenMinute;
    const marketCloseInMinutes = this.marketCloseHour * 60 + this.marketCloseMinute;
    const preMarketStartInMinutes = this.preMarketStartHour * 60 + this.preMarketStartMinute;
    const postMarketEndInMinutes = this.postMarketEndHour * 60 + this.postMarketEndMinute;

    // Determine the current phase
    if (currentTimeInMinutes < preMarketStartInMinutes || currentTimeInMinutes >= postMarketEndInMinutes) {
      return 'market-closed';
    } else if (currentTimeInMinutes >= preMarketStartInMinutes && currentTimeInMinutes < marketOpenInMinutes) {
      return 'pre-market';
    } else if (currentTimeInMinutes >= marketOpenInMinutes && currentTimeInMinutes < marketCloseInMinutes) {
      return 'market-open';
    } else {
      return 'post-market';
    }
  }

  public isTradingAllowed(): boolean {
    const phase = this.getCurrentPhase();
    return phase === 'pre-market' || phase === 'market-open' || phase === 'post-market';
  }

  public getNextPhaseChange(): Date {
    const now = new Date();
    const currentPhase = this.getCurrentPhase();
    const nextPhase = this.getNextPhase(currentPhase);
    
    let targetTime = new Date(now);
    
    switch (currentPhase) {
      case 'pre-market':
        targetTime.setHours(this.marketOpenHour, this.marketOpenMinute, 0, 0);
        break;
      case 'market-open':
        targetTime.setHours(this.marketCloseHour, this.marketCloseMinute, 0, 0);
        break;
      case 'post-market':
        targetTime.setHours(this.postMarketEndHour, this.postMarketEndMinute, 0, 0);
        break;
      case 'market-closed':
        // If market is closed, set to next day's pre-market
        targetTime.setDate(targetTime.getDate() + 1);
        targetTime.setHours(this.preMarketStartHour, this.preMarketStartMinute, 0, 0);
        break;
    }

    // If the target time is in the past, add 24 hours
    if (targetTime < now) {
      targetTime.setDate(targetTime.getDate() + 1);
    }

    return targetTime;
  }

  private getNextPhase(currentPhase: TradingPhase): TradingPhase {
    switch (currentPhase) {
      case 'pre-market':
        return 'market-open';
      case 'market-open':
        return 'post-market';
      case 'post-market':
        return 'market-closed';
      case 'market-closed':
        return 'pre-market';
      default:
        return 'market-closed';
    }
  }
} 