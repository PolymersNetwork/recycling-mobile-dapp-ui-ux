import { PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { createTransferInstruction, getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from '@solana/spl-token';

export interface DonationRequest {
  amount: number;
  token: 'SOL' | 'PLY' | 'USDC';
  recipient: string;
  reference?: string;
  memo?: string;
}

export interface FeeCalculation {
  baseAmount: number;
  platformFee: number; // 2%
  solanaFee: number;   // Network fee
  totalAmount: number;
  totalFees: number;
}

export class SolanaPayService {
  private static readonly PLATFORM_FEE_RATE = 0.02; // 2%
  private static readonly SOLANA_NETWORK_FEE = 0.000005; // ~5000 lamports

  /**
   * Calculate fees for a donation transaction
   */
  static calculateFees(amount: number, token: string): FeeCalculation {
    const baseAmount = amount;
    const platformFee = baseAmount * this.PLATFORM_FEE_RATE;
    
    // Solana network fee is constant regardless of token
    const solanaFee = this.SOLANA_NETWORK_FEE;
    
    const totalFees = platformFee + (token === 'SOL' ? solanaFee : 0);
    const totalAmount = baseAmount + totalFees;

    return {
      baseAmount,
      platformFee,
      solanaFee,
      totalAmount,
      totalFees
    };
  }

  /**
   * Create a donation transaction for SOL
   */
  static async createSOLDonation(
    request: DonationRequest,
    senderPublicKey: PublicKey
  ): Promise<Transaction> {
    const fees = this.calculateFees(request.amount, 'SOL');
    const recipientPublicKey = new PublicKey(request.recipient);
    
    const transaction = new Transaction();
    
    // Main donation transfer
    const donationInstruction = SystemProgram.transfer({
      fromPubkey: senderPublicKey,
      toPubkey: recipientPublicKey,
      lamports: Math.round(request.amount * LAMPORTS_PER_SOL)
    });
    
    // Platform fee transfer (to Polymers treasury)
    const platformFeeInstruction = SystemProgram.transfer({
      fromPubkey: senderPublicKey,
      toPubkey: new PublicKey('PolymersNetworkTreasury111111111111111111'), // Placeholder
      lamports: Math.round(fees.platformFee * LAMPORTS_PER_SOL)
    });

    transaction.add(donationInstruction);
    transaction.add(platformFeeInstruction);

    // Add memo if provided
    if (request.memo) {
      const memoInstruction = new TransactionInstruction({
        keys: [],
        programId: new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'),
        data: Buffer.from(request.memo)
      });
      transaction.add(memoInstruction);
    }

    return transaction;
  }

  /**
   * Create a donation transaction for SPL tokens (PLY, USDC)
   */
  static async createTokenDonation(
    request: DonationRequest,
    senderPublicKey: PublicKey,
    tokenMintAddress: PublicKey,
    tokenDecimals: number
  ): Promise<Transaction> {
    const fees = this.calculateFees(request.amount, request.token);
    const recipientPublicKey = new PublicKey(request.recipient);
    
    const transaction = new Transaction();
    
    // Get associated token accounts
    const senderTokenAccount = await getAssociatedTokenAddress(
      tokenMintAddress,
      senderPublicKey
    );
    
    const recipientTokenAccount = await getAssociatedTokenAddress(
      tokenMintAddress,
      recipientPublicKey
    );
    
    const platformTokenAccount = await getAssociatedTokenAddress(
      tokenMintAddress,
      new PublicKey('PolymersNetworkTreasury111111111111111111') // Placeholder
    );

    // Main donation transfer
    const donationAmount = Math.round(request.amount * Math.pow(10, tokenDecimals));
    const donationInstruction = createTransferInstruction(
      senderTokenAccount,
      recipientTokenAccount,
      senderPublicKey,
      donationAmount
    );

    // Platform fee transfer
    const platformFeeAmount = Math.round(fees.platformFee * Math.pow(10, tokenDecimals));
    const platformFeeInstruction = createTransferInstruction(
      senderTokenAccount,
      platformTokenAccount,
      senderPublicKey,
      platformFeeAmount
    );

    transaction.add(donationInstruction);
    transaction.add(platformFeeInstruction);

    return transaction;
  }

  /**
   * Generate QR code data for Solana Pay
   */
  static generatePaymentURL(request: DonationRequest): string {
    const baseURL = 'solana:';
    const params = new URLSearchParams();
    
    params.append('recipient', request.recipient);
    params.append('amount', request.amount.toString());
    
    if (request.token !== 'SOL') {
      // Add SPL token mint address
      const tokenMints = {
        PLY: 'PLY123456789...', // Placeholder
        USDC: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
      };
      params.append('spl-token', tokenMints[request.token as keyof typeof tokenMints]);
    }
    
    if (request.reference) {
      params.append('reference', request.reference);
    }
    
    if (request.memo) {
      params.append('memo', request.memo);
    }

    return `${baseURL}${request.recipient}?${params.toString()}`;
  }

  /**
   * Validate a Solana Pay URL
   */
  static validatePaymentURL(url: string): boolean {
    try {
      if (!url.startsWith('solana:')) return false;
      
      const [, rest] = url.split('solana:');
      const [recipient, queryString] = rest.split('?');
      
      // Validate recipient is a valid public key
      new PublicKey(recipient);
      
      if (queryString) {
        const params = new URLSearchParams(queryString);
        const amount = params.get('amount');
        
        if (amount && isNaN(Number(amount))) return false;
      }
      
      return true;
    } catch {
      return false;
    }
  }
}

// Import this for memo instruction
class TransactionInstruction {
  keys: any[];
  programId: PublicKey;
  data: Buffer;

  constructor(opts: { keys: any[]; programId: PublicKey; data: Buffer }) {
    this.keys = opts.keys;
    this.programId = opts.programId;
    this.data = opts.data;
  }
}