interface AnalyticsEvent {
  event: string;
  properties: Record<string, any>;
  timestamp: number;
  userId?: string;
}

export class EventsService {
  private events: AnalyticsEvent[] = [];
  private batchSize = 10;
  private flushInterval = 30000; // 30 seconds

  constructor() {
    this.startBatchFlusher();
  }

  track(event: string, properties: Record<string, any>, userId?: string): void {
    const analyticsEvent: AnalyticsEvent = {
      event,
      properties,
      timestamp: Date.now(),
      userId
    };

    this.events.push(analyticsEvent);
    console.log('📊 Event tracked:', event, properties);

    if (this.events.length >= this.batchSize) {
      this.flush();
    }
  }

  private startBatchFlusher(): void {
    setInterval(() => {
      if (this.events.length > 0) {
        this.flush();
      }
    }, this.flushInterval);
  }

  private async flush(): Promise<void> {
    if (this.events.length === 0) return;

    const eventsToSend = [...this.events];
    this.events = [];

    try {
      // In production, send to analytics service (Mixpanel, Amplitude, etc.)
      console.log('📤 Flushing events:', eventsToSend.length);
      
      // Mock API call
      await this.sendToAnalytics(eventsToSend);
    } catch (error) {
      console.error('Failed to send analytics events:', error);
      // Re-add events to queue for retry
      this.events.unshift(...eventsToSend);
    }
  }

  private async sendToAnalytics(events: AnalyticsEvent[]): Promise<void> {
    // Mock implementation
    // In production, this would send to your analytics service
    return new Promise((resolve) => {
      setTimeout(resolve, 100);
    });
  }

  // Predefined event types
  trackRecycleStart(method: 'camera' | 'qr' | 'nfc'): void {
    this.track('recycle_start', { method });
  }

  trackRecycleComplete(units: number, weight: number, reward: number): void {
    this.track('recycle_complete', { units, weight, reward });
  }

  trackWalletConnect(walletType: string): void {
    this.track('wallet_connect', { walletType });
  }

  trackRewardClaim(amount: number, tokenType: string): void {
    this.track('reward_claim', { amount, tokenType });
  }

  trackProjectContribute(projectId: string, amount: number): void {
    this.track('project_contribute', { projectId, amount });
  }

  trackNFTMint(badgeType: string): void {
    this.track('nft_mint', { badgeType });
  }

  trackMarketplacePurchase(itemId: string, price: number): void {
    this.track('marketplace_purchase', { itemId, price });
  }

  trackScreenView(screenName: string): void {
    this.track('screen_view', { screenName });
  }

  trackError(error: string, context?: Record<string, any>): void {
    this.track('error', { error, ...context });
  }
}

export const eventsService = new EventsService();