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
  /**
   * Process one or multiple recycle operations with fraud detection and reward updates
   */
  static async processRecycleOperation(
    scanType: 'camera' | 'qr' | 'nfc',
    scanData: any | any[],
    userWallet: string,
    location: { lat: number; lng: number }
  ): Promise<OperationResult<any>> {
    try {
      const scans = Array.isArray(scanData) ? scanData : [scanData];
      const results: any[] = [];

      for (const data of scans) {
        eventsService.trackRecycleStart(scanType);

        let recycleUnit;
        switch (scanType) {
          case 'camera':
            recycleUnit = await recycleService.scanPlastic(data, location);
            break;
          case 'qr':
            recycleUnit = await recycleService.scanQRCode(data);
            break;
          case 'nfc':
            recycleUnit = await recycleService.scanNFC(data);
            break;
          default:
            throw new Error('Invalid scan type');
        }

        if (!recycleUnit) {
          throw new Error('Failed to process scan data');
        }

        const fraudCheck = await aiService.detectFraud(recycleUnit);
        if (fraudCheck.isFraud) {
          eventsService.trackError('fraud_detected', {
            unitId: recycleUnit.id,
            reasons: fraudCheck.reasons,
          });
          // Return as part of the results instead of throwing
          results.push({ recycleUnit, fraud: true, fraudCheck });
          continue;
        }

        const batchResult = await recycleService.submitRecycleBatch([recycleUnit], userWallet);
        await rewardsService.addRewards(userWallet, {
          PLY: batchResult.plyReward,
          CRT: batchResult.crtReward,
        });

        eventsService.trackRecycleComplete(1, recycleUnit.weight, batchResult.plyReward);

        results.push({
          recycleUnit,
          rewards: batchResult,
          fraudCheck,
        });
      }

      return { success: true, data: results };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      eventsService.trackError('recycle_operation_failed', { error: message });
      return { success: false, error: message };
    }
  }

  static async batchProcessRecycling(units: any[], userWallet: string): Promise<OperationResult<any>> {
    try {
      const result = await recycleService.submitRecycleBatch(units, userWallet);

      const totalWeight = units.reduce((sum, unit) => sum + unit.weight, 0);
      eventsService.trackRecycleComplete(units.length, totalWeight, result.plyReward);

      return { success: true, data: result };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      eventsService.trackError('batch_process_failed', { error: message });
      return { success: false, error: message };
    }
  }

  static async processRewardClaim(userWallet: string, rewardType: 'PLY' | 'CRT' | 'NFT'): Promise<OperationResult<any>> {
    try {
      const pendingRewards = await rewardsService.previewRewards(userWallet);
      const success = await rewardsService.claimRewards(userWallet, pendingRewards);
      eventsService.trackRewardClaim(pendingRewards.length, rewardType);

      return { success: true, data: { amount: pendingRewards.length, type: rewardType, success } };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      eventsService.trackError('reward_claim_failed', { error: message });
      return { success: false, error: message };
    }
  }

  static async processProjectContribution(projectId: string, amount: number, userWallet: string): Promise<OperationResult<any>> {
    try {
      eventsService.trackProjectContribute(projectId, amount);
      return { success: true, data: { projectId, amount, txId: `contrib_${Date.now()}` } };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      eventsService.trackError('project_contribution_failed', { error: message });
      return { success: false, error: message };
    }
  }

  static async processNFTMint(badgeType: string, userWallet: string): Promise<OperationResult<any>> {
    try {
      const mintAddress = `nft_${badgeType}_${Date.now()}`;
      eventsService.trackNFTMint(badgeType);

      return { success: true, data: { mintAddress, badgeType } };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      eventsService.trackError('nft_mint_failed', { error: message });
      return { success: false, error: message };
    }
  }
}

export const operations = Operations;
