export class HeliusService {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey?: string, network: 'mainnet' | 'devnet' = 'devnet') {
    this.apiKey = apiKey || '';
    this.baseUrl = `https://api.helius.xyz/v0`;
  }

  async getAssets(ownerAddress: string): Promise<any[]> {
    if (!this.apiKey) {
      console.warn('Helius API key not provided');
      return [];
    }

    try {
      const response = await fetch(`${this.baseUrl}/addresses/${ownerAddress}/balances?api-key=${this.apiKey}`);
      const data = await response.json();
      return data.tokens || [];
    } catch (error) {
      console.error('Error fetching assets from Helius:', error);
      return [];
    }
  }

  async getTransactionHistory(
    address: string, 
    limit: number = 100
  ): Promise<any[]> {
    if (!this.apiKey) {
      console.warn('Helius API key not provided');
      return [];
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/addresses/${address}/transactions?api-key=${this.apiKey}&limit=${limit}`
      );
      const data = await response.json();
      return data || [];
    } catch (error) {
      console.error('Error fetching transaction history from Helius:', error);
      return [];
    }
  }

  async getNFTs(ownerAddress: string): Promise<any[]> {
    if (!this.apiKey) {
      console.warn('Helius API key not provided');
      return [];
    }

    try {
      const response = await fetch(`${this.baseUrl}/addresses/${ownerAddress}/nfts?api-key=${this.apiKey}`);
      const data = await response.json();
      return data.nfts || [];
    } catch (error) {
      console.error('Error fetching NFTs from Helius:', error);
      return [];
    }
  }

  async webhookSubscribe(
    webhook_url: string,
    account_addresses: string[],
    transaction_types: string[] = ['any']
  ): Promise<boolean> {
    if (!this.apiKey) {
      console.warn('Helius API key not provided');
      return false;
    }

    try {
      const response = await fetch(`${this.baseUrl}/webhooks?api-key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          webhookURL: webhook_url,
          accountAddresses: account_addresses,
          transactionTypes: transaction_types,
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Error setting up Helius webhook:', error);
      return false;
    }
  }
}

export const heliusService = new HeliusService();