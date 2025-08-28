import { Connection, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import { TOKEN_METADATA } from '@/constants';
import { aiService } from './ai';
import { eventsService } from './events';

interface RecycleUnit {
  id: string;
  type: 'plastic' | 'metal' | 'glass' | 'paper';
  weight: number;
  location: { lat: number; lng: number };
  timestamp: number;
  verified: boolean;
}

interface RecycleResult {
  plyReward: number;
  crtReward: number;
  nftBadges: string[];
  signature?: string;
}

export class RecycleService {
  private connection: Connection;
  private programId: PublicKey;

  constructor() {
    this.connection = new Connection(
      process.env.EXPO_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com',
      'confirmed'
    );
    this.programId = new PublicKey(
      process.env.EXPO_PUBLIC_PROGRAM_ID || '11111111111111111111111111111112'
    );
  }

  async scanPlastic(imageData: string, location: { lat: number; lng: number }): Promise<RecycleUnit> {
    // AI plastic detection
    const detection = await aiService.detectPlastic(imageData);
    
    const unit: RecycleUnit = {
      id: `recycle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: detection.type as 'plastic',
      weight: detection.estimatedWeight || 0.1,
      location,
      timestamp: Date.now(),
      verified: detection.confidence > 0.8
    };

    // Log event
    eventsService.track('plastic_scanned', {
      unitId: unit.id,
      type: unit.type,
      confidence: detection.confidence,
      location: unit.location
    });

    return unit;
  }

  async scanQRCode(qrData: string): Promise<RecycleUnit | null> {
    try {
      const data = JSON.parse(qrData);
      if (data.type === 'recycle_bin') {
        return {
          id: data.binId,
          type: 'plastic',
          weight: data.weight || 0.5,
          location: data.location,
          timestamp: Date.now(),
          verified: true
        };
      }
    } catch (error) {
      console.error('Invalid QR code:', error);
    }
    return null;
  }

  async scanNFC(nfcData: any): Promise<RecycleUnit | null> {
    try {
      if (nfcData.type === 'smart_bin') {
        return {
          id: nfcData.binId,
          type: nfcData.wasteType || 'plastic',
          weight: nfcData.weight || 0.3,
          location: nfcData.location,
          timestamp: Date.now(),
          verified: true
        };
      }
    } catch (error) {
      console.error('Invalid NFC data:', error);
    }
    return null;
  }

  async submitRecycleBatch(units: RecycleUnit[], userWallet: string): Promise<RecycleResult> {
    // Calculate rewards
    const totalWeight = units.reduce((sum, unit) => sum + unit.weight, 0);
    const plyReward = totalWeight * 10; // 10 PLY per kg
    const crtReward = totalWeight * 0.5; // 0.5 CRT per kg

    // Check for NFT badges
    const nftBadges = await this.checkNFTMilestones(totalWeight, units.length);

    try {
      // Submit to Solana (mock implementation)
      const signature = await this.sendSolanaTransaction(units, userWallet);

      // Log successful recycle
      eventsService.track('recycle_batch_submitted', {
        units: units.length,
        totalWeight,
        plyReward,
        crtReward,
        signature,
        userWallet
      });

      return {
        plyReward,
        crtReward,
        nftBadges,
        signature
      };
    } catch (error) {
      console.error('Failed to submit recycle batch:', error);
      throw error;
    }
  }

  private async checkNFTMilestones(weight: number, count: number): Promise<string[]> {
    const badges: string[] = [];
    
    if (weight >= 1.0) badges.push('first_kg');
    if (count >= 10) badges.push('ten_items');
    if (weight >= 10.0) badges.push('eco_warrior');
    
    return badges;
  }

  private async sendSolanaTransaction(units: RecycleUnit[], userWallet: string): Promise<string> {
    // Mock Solana transaction for now
    // In production, this would interact with your Solana program
    return `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async getRecycleHistory(userWallet: string): Promise<RecycleUnit[]> {
    // Mock implementation - in production, fetch from Supabase
    return [];
  }

  async getLeaderboard(): Promise<Array<{ wallet: string; totalWeight: number; rank: number }>> {
    // Mock implementation - in production, fetch from Supabase
    return [
      { wallet: 'user1...', totalWeight: 25.5, rank: 1 },
      { wallet: 'user2...', totalWeight: 18.2, rank: 2 },
      { wallet: 'user3...', totalWeight: 12.8, rank: 3 }
    ];
  }
}

export const recycleService = new RecycleService();