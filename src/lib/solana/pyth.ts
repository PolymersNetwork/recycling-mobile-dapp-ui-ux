import { Connection, PublicKey } from '@solana/web3.js';
import { PythHttpClient, getPythProgramKeyForCluster, PythCluster } from '@pythnetwork/client';

export class PythPriceService {
  private pythClient: PythHttpClient;
  private connection: Connection;

  // Price feed IDs for different tokens
  private readonly PRICE_FEEDS = {
    'SOL/USD': 'H6ARHf6YXhGYeQfUzQNGk6rDNnLBQKrenN712K4AQJEG',
    'USDC/USD': 'Gnt27xtC473ZT2Mw5u8wZ68Z3gULkSTb5DuxJy7eJotD',
    'ETH/USD': 'JBu1AL4obBcCMqKBBxhpWCNUt136ijcuMZLFvTP7iWdB',
    'BTC/USD': 'GVXRSBjFk6e6J3NbVPXohDJetcTjaeeuykUpbQF8UoMU',
    // Add more feeds as needed
  };

  constructor(connection?: Connection, cluster: PythCluster = 'devnet') {
    this.connection = connection || new Connection(
      cluster === 'mainnet-beta' 
        ? 'https://api.mainnet-beta.solana.com'
        : 'https://api.devnet.solana.com'
    );
    
    this.pythClient = new PythHttpClient(this.connection, getPythProgramKeyForCluster(cluster));
  }

  async getPrice(symbol: string): Promise<number | null> {
    try {
      const feedId = this.PRICE_FEEDS[symbol as keyof typeof this.PRICE_FEEDS];
      if (!feedId) {
        console.warn(`Price feed not found for ${symbol}`);
        return null;
      }

      const priceFeeds = await this.pythClient.getAssetPricesFromAccounts([new PublicKey(feedId)]);
      
      if (priceFeeds.length > 0 && priceFeeds[0]) {
        const priceData = priceFeeds[0] as any;
        return priceData.price || priceData;
      }
      
      return null;
    } catch (error) {
      console.error(`Error fetching price for ${symbol}:`, error);
      return null;
    }
  }

  async getPrices(symbols: string[]): Promise<Record<string, number | null>> {
    const prices: Record<string, number | null> = {};
    
    try {
      const feedIds = symbols
        .map(symbol => this.PRICE_FEEDS[symbol as keyof typeof this.PRICE_FEEDS])
        .filter(Boolean)
        .map(id => new PublicKey(id));

      if (feedIds.length === 0) {
        symbols.forEach(symbol => {
          prices[symbol] = null;
        });
        return prices;
      }

      const priceFeeds = await this.pythClient.getAssetPricesFromAccounts(feedIds);
      
      symbols.forEach((symbol, index) => {
        const feed = priceFeeds[index];
        const priceData = feed as any;
        prices[symbol] = priceData?.price || priceData || null;
      });

      return prices;
    } catch (error) {
      console.error('Error fetching multiple prices:', error);
      symbols.forEach(symbol => {
        prices[symbol] = null;
      });
      return prices;
    }
  }

  async subscribeToPriceUpdates(
    symbol: string,
    callback: (price: number) => void
  ): Promise<() => void> {
    const feedId = this.PRICE_FEEDS[symbol as keyof typeof this.PRICE_FEEDS];
    if (!feedId) {
      console.warn(`Price feed not found for ${symbol}`);
      return () => {};
    }

    // Set up subscription (this is a simplified version)
    const interval = setInterval(async () => {
      const price = await this.getPrice(symbol);
      if (price !== null) {
        callback(price);
      }
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }

  // Get historical price data (mock implementation)
  async getHistoricalPrices(
    symbol: string,
    days: number = 7
  ): Promise<Array<{ timestamp: number; price: number }>> {
    // This is a mock implementation
    // In a real app, you'd fetch historical data from Pyth or another source
    const currentPrice = await this.getPrice(symbol) || 100;
    const historicalData: Array<{ timestamp: number; price: number }> = [];
    
    for (let i = days; i >= 0; i--) {
      const timestamp = Date.now() - (i * 24 * 60 * 60 * 1000);
      const variance = (Math.random() - 0.5) * 0.1; // ±5% variance
      const price = currentPrice * (1 + variance);
      
      historicalData.push({ timestamp, price });
    }
    
    return historicalData;
  }
}

export const pythPriceService = new PythPriceService();