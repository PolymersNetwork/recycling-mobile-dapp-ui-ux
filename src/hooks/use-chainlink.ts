import { useState, useEffect } from 'react';
import { useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';

interface ChainlinkPriceFeed {
  symbol: string;
  price: number;
  timestamp: number;
  confidence: number;
}

interface ChainlinkOracle {
  address: string;
  description: string;
  decimals: number;
}

// Solana Chainlink price feed addresses
const CHAINLINK_ORACLES: Record<string, ChainlinkOracle> = {
  'SOL/USD': {
    address: 'GvDMxPzN1sCj7L26YDK2HnMRXEQmQ2aemov8YBtPS7vR',
    description: 'SOL/USD',
    decimals: 8
  },
  'BTC/USD': {
    address: 'GvDMxPzN1sCj7L26YDK2HnMRXEQmQ2aemov8YBtPS7vR',
    description: 'BTC/USD',
    decimals: 8
  },
  'ETH/USD': {
    address: 'JBu1AL4obBcCMqKBBxhpWCNUt136ijcuMZLFvTP7iWdB',
    description: 'ETH/USD',
    decimals: 8
  }
};

export function useChainlink() {
  const { connection } = useConnection();
  const [priceFeeds, setPriceFeeds] = useState<Record<string, ChainlinkPriceFeed>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPriceFeed = async (symbol: string): Promise<ChainlinkPriceFeed | null> => {
    const oracle = CHAINLINK_ORACLES[symbol];
    if (!oracle) {
      console.error(`No oracle found for ${symbol}`);
      return null;
    }

    try {
      // In a real implementation, this would fetch from Chainlink oracle
      // For now, we'll use mock data with realistic price movements
      const mockPrices: Record<string, number> = {
        'SOL/USD': 98.50 + (Math.random() - 0.5) * 10,
        'BTC/USD': 43500 + (Math.random() - 0.5) * 2000,
        'ETH/USD': 2650 + (Math.random() - 0.5) * 200,
      };

      const price = mockPrices[symbol] || 0;
      
      return {
        symbol,
        price,
        timestamp: Date.now(),
        confidence: 0.95 + Math.random() * 0.05 // 95-100% confidence
      };
    } catch (error) {
      console.error(`Failed to fetch price for ${symbol}:`, error);
      return null;
    }
  };

  const fetchAllPrices = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const symbols = Object.keys(CHAINLINK_ORACLES);
      const prices: Record<string, ChainlinkPriceFeed> = {};
      
      for (const symbol of symbols) {
        const priceFeed = await fetchPriceFeed(symbol);
        if (priceFeed) {
          prices[symbol] = priceFeed;
        }
      }
      
      setPriceFeeds(prices);
    } catch (error) {
      console.error('Failed to fetch price feeds:', error);
      setError('Failed to fetch price data');
    } finally {
      setLoading(false);
    }
  };

  const getPrice = (symbol: string): ChainlinkPriceFeed | null => {
    return priceFeeds[symbol] || null;
  };

  const getPriceChange = (symbol: string, previousPrice: number): number => {
    const currentFeed = priceFeeds[symbol];
    if (!currentFeed) return 0;
    
    return ((currentFeed.price - previousPrice) / previousPrice) * 100;
  };

  const subscribeToUpdates = (symbol: string, callback: (feed: ChainlinkPriceFeed) => void) => {
    // In a real implementation, this would set up a WebSocket or polling subscription
    const interval = setInterval(async () => {
      const feed = await fetchPriceFeed(symbol);
      if (feed) {
        callback(feed);
      }
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  };

  // Environmental impact pricing (theoretical)
  const getCarbonCreditPrice = async (): Promise<number> => {
    // Mock carbon credit price in USD
    return 15.75 + (Math.random() - 0.5) * 2;
  };

  const getRecyclingCreditPrice = async (): Promise<number> => {
    // Mock recycling credit price in USD
    return 0.25 + (Math.random() - 0.5) * 0.05;
  };

  const calculateEnvironmentalValue = async (
    plasticWeight: number, // in kg
    plasticType: string
  ): Promise<{ carbonCredits: number; recyclingCredits: number; totalUsd: number }> => {
    const carbonPrice = await getCarbonCreditPrice();
    const recyclingPrice = await getRecyclingCreditPrice();
    
    // Simplified calculation - different plastic types have different environmental values
    const carbonReduction = plasticWeight * 2.1; // kg CO2 equivalent per kg plastic
    const recyclingValue = plasticWeight * 1.0; // 1:1 recycling credit ratio
    
    const carbonCredits = carbonReduction;
    const recyclingCredits = recyclingValue;
    const totalUsd = (carbonCredits * carbonPrice) + (recyclingCredits * recyclingPrice);
    
    return {
      carbonCredits,
      recyclingCredits,
      totalUsd
    };
  };

  useEffect(() => {
    fetchAllPrices();
    
    // Set up periodic updates
    const interval = setInterval(fetchAllPrices, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, []);

  return {
    priceFeeds,
    loading,
    error,
    fetchPriceFeed,
    fetchAllPrices,
    getPrice,
    getPriceChange,
    subscribeToUpdates,
    getCarbonCreditPrice,
    getRecyclingCreditPrice,
    calculateEnvironmentalValue
  };
}