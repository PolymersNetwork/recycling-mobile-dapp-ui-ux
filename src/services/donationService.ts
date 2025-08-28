import { Project } from '@/types';

export interface Donation {
  id: string;
  projectId: string;
  amount: number;
  currency: 'PLY' | 'USDC' | 'SOL';
  donorAddress: string;
  timestamp: number;
  txId: string;
  message?: string;
}

class DonationService {
  async donate(
    projectId: string, 
    amount: number, 
    currency: 'PLY' | 'USDC' | 'SOL',
    walletAddress: string,
    message?: string
  ): Promise<Donation> {
    try {
      // Simulate donation processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const donation: Donation = {
        id: `DON_${Date.now()}`,
        projectId,
        amount,
        currency,
        donorAddress: walletAddress,
        timestamp: Date.now(),
        txId: `${currency}_TX_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        message
      };

      return donation;
    } catch (error) {
      console.error('Donation failed:', error);
      throw new Error('Failed to process donation');
    }
  }

  async getDonationHistory(walletAddress: string): Promise<Donation[]> {
    // Mock donation history
    return [
      {
        id: 'DON_1',
        projectId: '1',
        amount: 100,
        currency: 'PLY',
        donorAddress: walletAddress,
        timestamp: Date.now() - 86400000,
        txId: 'PLY_TX_123456',
        message: 'Supporting ocean cleanup!'
      },
      {
        id: 'DON_2', 
        projectId: '2',
        amount: 50,
        currency: 'USDC',
        donorAddress: walletAddress,
        timestamp: Date.now() - 172800000,
        txId: 'USDC_TX_789012'
      }
    ];
  }

  async getProjectDonations(projectId: string): Promise<Donation[]> {
    // Mock project donations
    return [
      {
        id: 'DON_1',
        projectId,
        amount: 250,
        currency: 'PLY',
        donorAddress: 'DONOR_ADDRESS_1',
        timestamp: Date.now() - 3600000,
        txId: 'PLY_TX_ABCD123',
        message: 'Great cause!'
      },
      {
        id: 'DON_2',
        projectId, 
        amount: 100,
        currency: 'USDC',
        donorAddress: 'DONOR_ADDRESS_2',
        timestamp: Date.now() - 7200000,
        txId: 'USDC_TX_EFGH456'
      }
    ];
  }

  async getTotalDonated(walletAddress: string): Promise<{ [currency: string]: number }> {
    const donations = await this.getDonationHistory(walletAddress);
    
    return donations.reduce((acc, donation) => {
      acc[donation.currency] = (acc[donation.currency] || 0) + donation.amount;
      return acc;
    }, {} as { [currency: string]: number });
  }
}

export const donationService = new DonationService();