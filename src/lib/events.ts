type EventCallback = (...args: any[]) => void;

export class EventEmitter {
  private events: Map<string, EventCallback[]> = new Map();

  on(event: string, callback: EventCallback): () => void {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    
    const callbacks = this.events.get(event)!;
    callbacks.push(callback);

    // Return unsubscribe function
    return () => {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    };
  }

  off(event: string, callback?: EventCallback): void {
    if (!callback) {
      this.events.delete(event);
      return;
    }

    const callbacks = this.events.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event: string, ...args: any[]): void {
    const callbacks = this.events.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(...args);
        } catch (error) {
          console.error(`Error in event callback for ${event}:`, error);
        }
      });
    }
  }

  once(event: string, callback: EventCallback): void {
    const onceCallback = (...args: any[]) => {
      this.off(event, onceCallback);
      callback(...args);
    };
    
    this.on(event, onceCallback);
  }
}

// Global event emitter instance
export const globalEvents = new EventEmitter();

// Predefined events
export const EVENTS = {
  // Wallet events
  WALLET_CONNECTED: 'wallet:connected',
  WALLET_DISCONNECTED: 'wallet:disconnected',
  WALLET_BALANCE_UPDATED: 'wallet:balance_updated',
  
  // Transaction events  
  TRANSACTION_PENDING: 'transaction:pending',
  TRANSACTION_CONFIRMED: 'transaction:confirmed',
  TRANSACTION_FAILED: 'transaction:failed',
  
  // Reward events
  REWARD_EARNED: 'reward:earned',
  REWARD_CLAIMED: 'reward:claimed',
  REWARD_DISTRIBUTION_STARTED: 'reward:distribution_started',
  REWARD_DISTRIBUTION_COMPLETED: 'reward:distribution_completed',
  
  // Recycling events
  RECYCLING_SUBMITTED: 'recycling:submitted',
  RECYCLING_VERIFIED: 'recycling:verified',
  RECYCLING_REJECTED: 'recycling:rejected',
  
  // NFT events
  NFT_MINTED: 'nft:minted',
  NFT_TRANSFERRED: 'nft:transferred',
  
  // Payment events
  PAYMENT_INITIATED: 'payment:initiated',
  PAYMENT_COMPLETED: 'payment:completed',
  PAYMENT_FAILED: 'payment:failed',
  
  // Profile events
  PROFILE_UPDATED: 'profile:updated',
  LEVEL_UP: 'profile:level_up',
  BADGE_EARNED: 'profile:badge_earned',
  
  // System events
  NOTIFICATION_RECEIVED: 'system:notification',
  ERROR_OCCURRED: 'system:error',
  CONNECTION_STATUS_CHANGED: 'system:connection_status',
} as const;

// Helper functions for common events
export const emitWalletConnected = (address: string, balance: number) => {
  globalEvents.emit(EVENTS.WALLET_CONNECTED, { address, balance });
};

export const emitTransactionConfirmed = (signature: string, amount: number, token: string) => {
  globalEvents.emit(EVENTS.TRANSACTION_CONFIRMED, { signature, amount, token });
};

export const emitRewardEarned = (amount: number, token: string, reason: string) => {
  globalEvents.emit(EVENTS.REWARD_EARNED, { amount, token, reason });
};

export const emitRecyclingSubmitted = (submissionId: string, reward: number) => {
  globalEvents.emit(EVENTS.RECYCLING_SUBMITTED, { submissionId, reward });
};

export const emitNFTMinted = (nftAddress: string, metadata: any) => {
  globalEvents.emit(EVENTS.NFT_MINTED, { nftAddress, metadata });
};

export const emitLevelUp = (newLevel: number, rewards: any[]) => {
  globalEvents.emit(EVENTS.LEVEL_UP, { newLevel, rewards });
};

export const emitError = (error: Error, context?: string) => {
  globalEvents.emit(EVENTS.ERROR_OCCURRED, { error, context });
};