import { PublicKey } from '@solana/web3.js';

export interface PaymentRequest {
  id: string;
  recipient: string;
  amount: number;
  token: 'SOL' | 'USDC' | 'PLY';
  reference: string;
  memo?: string;
  label?: string;
  message?: string;
}

export interface SolanaPayQR {
  url: string;
  qrCode: string;
  reference: PublicKey;
  recipient: PublicKey;
  amount?: number;
  token?: string;
}

export interface DonationRequest {
  id: string;
  project_id?: string;
  recipient_address: string;
  amount: number;
  token: 'SOL' | 'USDC' | 'PLY';
  donor_address?: string;
  message?: string;
  category: 'environmental' | 'recycling' | 'cleanup' | 'education';
  fee_percentage: number; // Platform fee (2%)
  estimated_fees: {
    platform_fee: number;
    network_fee: number;
    total_fee: number;
  };
}

export interface PaymentTransaction {
  id: string;
  signature: string;
  from_address: string;
  to_address: string;
  amount: number;
  token: string;
  type: 'donation' | 'reward' | 'payment' | 'fee';
  status: 'pending' | 'confirmed' | 'failed';
  confirmations: number;
  block_time?: number;
  fee: number;
  memo?: string;
  created_at: string;
  confirmed_at?: string;
}

export interface SolanaPaymentConfig {
  network: 'mainnet-beta' | 'devnet' | 'testnet';
  rpc_endpoint: string;
  fee_payer?: string;
  platform_fee_account: string;
  fee_percentage: number;
}

export interface TokenInfo {
  symbol: string;
  name: string;
  mint: string;
  decimals: number;
  logo_uri?: string;
  price_usd?: number;
  market_cap?: number;
  volume_24h?: number;
  change_24h?: number;
}