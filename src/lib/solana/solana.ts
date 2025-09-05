import { 
  Connection, 
  PublicKey, 
  Transaction, 
  SystemProgram, 
  LAMPORTS_PER_SOL,
  Keypair,
  sendAndConfirmTransaction
} from '@solana/web3.js';
import { 
  TOKEN_PROGRAM_ID, 
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  getAccount
} from '@solana/spl-token';

export class SolanaService {
  private connection: Connection;
  private network: string;

  constructor(rpcEndpoint?: string, network: string = 'devnet') {
    this.network = network;
    this.connection = new Connection(
      rpcEndpoint || this.getDefaultRPC(),
      'confirmed'
    );
  }

  private getDefaultRPC(): string {
    switch (this.network) {
      case 'mainnet-beta':
        return 'https://api.mainnet-beta.solana.com';
      case 'devnet':
        return 'https://api.devnet.solana.com';
      case 'testnet':
        return 'https://api.testnet.solana.com';
      default:
        return 'https://api.devnet.solana.com';
    }
  }

  async getBalance(publicKey: string): Promise<number> {
    try {
      const pubkey = new PublicKey(publicKey);
      const balance = await this.connection.getBalance(pubkey);
      return balance / LAMPORTS_PER_SOL;
    } catch (error) {
      console.error('Error getting balance:', error);
      throw error;
    }
  }

  async getTokenBalance(
    walletAddress: string, 
    tokenMint: string
  ): Promise<number> {
    try {
      const walletPubkey = new PublicKey(walletAddress);
      const mintPubkey = new PublicKey(tokenMint);
      
      const tokenAccount = await getAssociatedTokenAddress(
        mintPubkey,
        walletPubkey
      );

      const accountInfo = await getAccount(this.connection, tokenAccount);
      return Number(accountInfo.amount);
    } catch (error) {
      console.error('Error getting token balance:', error);
      return 0;
    }
  }

  async createSOLTransaction(
    fromPubkey: PublicKey,
    toPubkey: PublicKey,
    amount: number,
    memo?: string
  ): Promise<Transaction> {
    const transaction = new Transaction();
    
    // Add SOL transfer instruction
    transaction.add(
      SystemProgram.transfer({
        fromPubkey,
        toPubkey,
        lamports: amount * LAMPORTS_PER_SOL,
      })
    );

    // Add memo if provided
    if (memo) {
      transaction.add({
        keys: [],
        programId: new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'),
        data: Buffer.from(memo, 'utf8'),
      });
    }

    // Get recent blockhash
    const { blockhash } = await this.connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = fromPubkey;

    return transaction;
  }

  async createTokenTransaction(
    fromPubkey: PublicKey,
    toPubkey: PublicKey,
    tokenMint: PublicKey,
    amount: number,
    decimals: number = 9
  ): Promise<Transaction> {
    const transaction = new Transaction();

    // Get or create associated token accounts
    const fromTokenAccount = await getAssociatedTokenAddress(
      tokenMint,
      fromPubkey
    );

    const toTokenAccount = await getAssociatedTokenAddress(
      tokenMint,
      toPubkey
    );

    // Check if recipient token account exists
    try {
      await getAccount(this.connection, toTokenAccount);
    } catch (error) {
      // Create recipient token account if it doesn't exist
      transaction.add(
        createAssociatedTokenAccountInstruction(
          fromPubkey, // payer
          toTokenAccount, // ata
          toPubkey, // owner
          tokenMint // mint
        )
      );
    }

    // Add transfer instruction
    transaction.add(
      createTransferInstruction(
        fromTokenAccount,
        toTokenAccount,
        fromPubkey,
        amount * Math.pow(10, decimals)
      )
    );

    // Get recent blockhash
    const { blockhash } = await this.connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = fromPubkey;

    return transaction;
  }

  async estimateTransactionFee(transaction: Transaction): Promise<number> {
    try {
      const feeCalculator = await this.connection.getFeeForMessage(
        transaction.compileMessage()
      );
      return feeCalculator.value || 5000; // Default 5000 lamports
    } catch (error) {
      console.error('Error estimating fee:', error);
      return 5000; // Default fallback
    }
  }

  async confirmTransaction(signature: string): Promise<boolean> {
    try {
      const confirmation = await this.connection.confirmTransaction(signature);
      return !confirmation.value.err;
    } catch (error) {
      console.error('Error confirming transaction:', error);
      return false;
    }
  }

  async getTransaction(signature: string) {
    try {
      return await this.connection.getTransaction(signature);
    } catch (error) {
      console.error('Error getting transaction:', error);
      return null;
    }
  }

  getConnection(): Connection {
    return this.connection;
  }
}

export const solanaService = new SolanaService();