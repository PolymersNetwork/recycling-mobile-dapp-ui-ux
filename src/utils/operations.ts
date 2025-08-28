import { recycleService } from '@/services/recycle';
import { aiService } from '@/services/ai';
import { eventsService } from '@/services/events';
import { rewardsService } from '@/services/rewardsService';

interface OperationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export class Operations {
  static async processRecycleOperation(
    scanType: 'camera' | 'qr' | 'nfc',
    scanData: any,
    userWallet: string,
    location: { lat: number; lng: number }
  ): Promise<OperationResult<any>> {
    try {
      eventsService.trackRecycleStart(scanType);

      let recycleUnit;
      
      switch (scanType) {
        case 'camera':
          recycleUnit = await recycleService.scanPlastic(scanData, location);
          break;
        case 'qr':
          recycleUnit = await recycleService.scanQRCode(scanData);
          break;
        case 'nfc':
          recycleUnit = await recycleService.scanNFC(scanData);
          break;
        default:
          throw new Error('Invalid scan type');
      }

      if (!recycleUnit) {
        throw new Error('Failed to process scan data');
      }

      // AI fraud detection
      const fraudCheck = await aiService.detectFraud(recycleUnit);
      if (fraudCheck.isFraud) {
        eventsService.trackError('fraud_detected', { 
          unitId: recycleUnit.id,
          reasons: fraudCheck.reasons 
        });
        throw new Error('Fraudulent activity detected');
      }

      // Submit batch (single unit for now)
      const result = await recycleService.submitRecycleBatch([recycleUnit], userWallet);
      
      // Update rewards
      await rewardsService.addRewards(userWallet, {
        PLY: result.plyReward,
        CRT: result.crtReward
      });

      eventsService.trackRecycleComplete(1, recycleUnit.weight, result.plyReward);

      return {
        success: true,
        data: {
          unit: recycleUnit,
          rewards: result,
          fraudCheck
        }
      };

    } catch (error) {
      eventsService.trackError('recycle_operation_failed', { error: error.message });
      return {
        success: false,
        error: error.message
      };
    }
  }

  static async batchProcessRecycling(
    units: any[],
    userWallet: string
  ): Promise<OperationResult<any>> {
    try {
      const result = await recycleService.submitRecycleBatch(units, userWallet);
      
      const totalWeight = units.reduce((sum, unit) => sum + unit.weight, 0);
      eventsService.trackRecycleComplete(units.length, totalWeight, result.plyReward);

      return {
        success: true,
        data: result
      };
    } catch (error) {
      eventsService.trackError('batch_process_failed', { error: error.message });
      return {
        success: false,
        error: error.message
      };
    }
  }

  static async processRewardClaim(
    userWallet: string,
    rewardType: 'PLY' | 'CRT' | 'NFT'
  ): Promise<OperationResult<any>> {
    try {
      const pendingRewards = await rewardsService.previewRewards(userWallet);
      const success = await rewardsService.claimRewards(userWallet, pendingRewards);
      eventsService.trackRewardClaim(pendingRewards.length, rewardType);

      return {
        success: true,
        data: { amount: pendingRewards.length, type: rewardType, success }
      };
    } catch (error) {
      eventsService.trackError('reward_claim_failed', { error: error.message });
      return {
        success: false,
        error: error.message
      };
    }
  }

  static async processProjectContribution(
    projectId: string,
    amount: number,
    userWallet: string
  ): Promise<OperationResult<any>> {
    try {
      // Mock project contribution
      eventsService.trackProjectContribute(projectId, amount);
      
      return {
        success: true,
        data: { projectId, amount, txId: `contrib_${Date.now()}` }
      };
    } catch (error) {
      eventsService.trackError('project_contribution_failed', { error: error.message });
      return {
        success: false,
        error: error.message
      };
    }
  }

  static async processNFTMint(
    badgeType: string,
    userWallet: string
  ): Promise<OperationResult<any>> {
    try {
      // Mock NFT minting
      const mintAddress = `nft_${badgeType}_${Date.now()}`;
      eventsService.trackNFTMint(badgeType);

      return {
        success: true,
        data: { mintAddress, badgeType }
      };
    } catch (error) {
      eventsService.trackError('nft_mint_failed', { error: error.message });
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export const operations = Operations;