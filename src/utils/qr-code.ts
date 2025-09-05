import { PublicKey } from '@solana/web3.js';
import { createQR, encodeURL, TransferRequestURLFields, findReference } from '@solana/pay';

export interface SolanaQROptions {
  recipient: string;
  amount?: number;
  reference?: string;
  label?: string;
  message?: string;
  memo?: string;
  token?: string;
}

export class SolanaQRGenerator {
  static async generatePaymentQR(options: SolanaQROptions): Promise<{
    url: string;
    qrCode: string;
    reference: PublicKey;
  }> {
    try {
      // Generate a unique reference for tracking
      const reference = new PublicKey(options.reference || PublicKey.unique().toString());
      
      const urlFields: TransferRequestURLFields = {
        recipient: new PublicKey(options.recipient),
        reference,
      };

      // Add optional fields
      if (options.amount) {
        // @ts-ignore - Solana Pay handles BigNumber conversion
        urlFields.amount = options.amount;
      }
      
      if (options.token) {
        urlFields.splToken = new PublicKey(options.token);
      }

      if (options.label) {
        urlFields.label = options.label;
      }

      if (options.message) {
        urlFields.message = options.message;
      }

      if (options.memo) {
        urlFields.memo = options.memo;
      }

      // Create the payment URL
      const url = encodeURL(urlFields);
      
      // Generate QR code
      const qrCode = createQR(url, 512, 'transparent');
      
      return {
        url: url.toString(),
        qrCode: await this.qrCodeToDataURL(qrCode),
        reference
      };
    } catch (error) {
      console.error('Error generating Solana Pay QR:', error);
      throw error;
    }
  }

  private static async qrCodeToDataURL(qrCode: any): Promise<string> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      qrCode.append(canvas);
      
      try {
        const dataURL = canvas.toDataURL();
        resolve(dataURL);
      } catch (error) {
        reject(error);
      }
    });
  }

  static async monitorTransaction(
    connection: any,
    reference: PublicKey,
    timeout: number = 60000
  ): Promise<string | null> {
    try {
      const signature = await findReference(connection, reference, {
        finality: 'confirmed'
      });
      
      return signature.signature;
    } catch (error) {
      console.error('Error monitoring transaction:', error);
      return null;
    }
  }

  static generateDonationQR(
    recipientAddress: string,
    projectName: string,
    amount?: number,
    token?: 'SOL' | 'USDC' | 'PLY'
  ) {
    const tokenMints = {
      USDC: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      PLY: 'PLY123...', // Replace with actual PLY mint
    };

    return this.generatePaymentQR({
      recipient: recipientAddress,
      amount,
      label: `Donation to ${projectName}`,
      message: `Support ${projectName} with your donation`,
      memo: `Donation-${projectName}-${Date.now()}`,
      token: token && token !== 'SOL' ? tokenMints[token] : undefined,
      reference: PublicKey.unique().toString()
    });
  }

  static generateRewardClaimQR(
    userAddress: string,
    rewardAmount: number,
    token: 'PLY' | 'RECO' | 'CRT' = 'PLY'
  ) {
    return this.generatePaymentQR({
      recipient: userAddress,
      amount: rewardAmount,
      label: `Claim ${token} Rewards`,
      message: `Claim your ${rewardAmount} ${token} tokens`,
      memo: `RewardClaim-${token}-${Date.now()}`,
      reference: PublicKey.unique().toString()
    });
  }
}