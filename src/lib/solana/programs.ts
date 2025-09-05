import { 
  Connection, 
  PublicKey, 
  Transaction, 
  TransactionInstruction,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  AccountMeta
} from '@solana/web3.js';
import { 
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress
} from '@solana/spl-token';

// Program IDs (these would be deployed program addresses)
export const POLYMERS_PROGRAM_ID = new PublicKey('PoLyMeRsProgram1111111111111111111111111111');
export const REWARDS_PROGRAM_ID = new PublicKey('ReWaRdSProgram11111111111111111111111111111');
export const NFT_PROGRAM_ID = new PublicKey('NFTProgram111111111111111111111111111111111');

// Token Mints
export const PLY_MINT = new PublicKey('PLYToken1111111111111111111111111111111111');
export const RECO_MINT = new PublicKey('RECOToken111111111111111111111111111111111');
export const CRT_MINT = new PublicKey('CRTToken1111111111111111111111111111111111');

export interface RecyclingSubmissionData {
  user: PublicKey;
  weight: number;
  plasticType: string;
  location: string;
  deviceSignature: string;
  timestamp: number;
}

export interface RewardDistribution {
  user: PublicKey;
  amount: number;
  token: PublicKey;
  reason: string;
}

export class PolymersProgram {
  constructor(
    private connection: Connection,
    private programId: PublicKey = POLYMERS_PROGRAM_ID
  ) {}

  // Submit recycling data on-chain
  async createRecyclingSubmission(
    data: RecyclingSubmissionData,
    payer: PublicKey
  ): Promise<Transaction> {
    const transaction = new Transaction();

    // Find PDA for the submission
    const [submissionPDA] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('submission'),
        data.user.toBuffer(),
        Buffer.from(data.timestamp.toString())
      ],
      this.programId
    );

    const instructionData = Buffer.concat([
      Buffer.from([0]), // Instruction discriminator for create_submission
      data.user.toBuffer(),
      Buffer.from([data.weight]), // Weight as u64
      Buffer.from(data.plasticType.padEnd(16, '\0')), // Fixed size string
      Buffer.from(data.location.padEnd(64, '\0')), // Fixed size string  
      Buffer.from(data.deviceSignature.padEnd(64, '\0')), // Device signature
      Buffer.from([data.timestamp]) // Timestamp as u64
    ]);

    const accounts: AccountMeta[] = [
      { pubkey: submissionPDA, isSigner: false, isWritable: true },
      { pubkey: data.user, isSigner: false, isWritable: false },
      { pubkey: payer, isSigner: true, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false }
    ];

    const instruction = new TransactionInstruction({
      keys: accounts,
      programId: this.programId,
      data: instructionData
    });

    transaction.add(instruction);
    return transaction;
  }

  // Verify submission and calculate rewards
  async verifySubmission(
    submissionPDA: PublicKey,
    verifier: PublicKey,
    approved: boolean,
    rewardAmount: number
  ): Promise<Transaction> {
    const transaction = new Transaction();

    const instructionData = Buffer.concat([
      Buffer.from([1]), // Instruction discriminator for verify_submission
      Buffer.from([approved ? 1 : 0]), // Boolean as u8
      Buffer.from([rewardAmount]) // Reward amount as u64
    ]);

    const accounts: AccountMeta[] = [
      { pubkey: submissionPDA, isSigner: false, isWritable: true },
      { pubkey: verifier, isSigner: true, isWritable: false }
    ];

    const instruction = new TransactionInstruction({
      keys: accounts,
      programId: this.programId,
      data: instructionData
    });

    transaction.add(instruction);
    return transaction;
  }

  // Create user profile PDA
  async createUserProfile(
    user: PublicKey,
    payer: PublicKey
  ): Promise<Transaction> {
    const transaction = new Transaction();

    const [profilePDA] = PublicKey.findProgramAddressSync(
      [Buffer.from('profile'), user.toBuffer()],
      this.programId
    );

    const instructionData = Buffer.concat([
      Buffer.from([2]), // Instruction discriminator for create_profile
      user.toBuffer()
    ]);

    const accounts: AccountMeta[] = [
      { pubkey: profilePDA, isSigner: false, isWritable: true },
      { pubkey: user, isSigner: false, isWritable: false },
      { pubkey: payer, isSigner: true, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false }
    ];

    const instruction = new TransactionInstruction({
      keys: accounts,
      programId: this.programId,
      data: instructionData
    });

    transaction.add(instruction);
    return transaction;
  }

  // Get submission PDA
  getSubmissionPDA(user: PublicKey, timestamp: number): PublicKey {
    const [pda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('submission'),
        user.toBuffer(),
        Buffer.from(timestamp.toString())
      ],
      this.programId
    );
    return pda;
  }

  // Get user profile PDA
  getUserProfilePDA(user: PublicKey): PublicKey {
    const [pda] = PublicKey.findProgramAddressSync(
      [Buffer.from('profile'), user.toBuffer()],
      this.programId
    );
    return pda;
  }
}

export class RewardsProgram {
  constructor(
    private connection: Connection,
    private programId: PublicKey = REWARDS_PROGRAM_ID
  ) {}

  // Distribute rewards to multiple users
  async distributeRewards(
    distributions: RewardDistribution[],
    payer: PublicKey
  ): Promise<Transaction> {
    const transaction = new Transaction();

    for (const dist of distributions) {
      const userTokenAccount = await getAssociatedTokenAddress(
        dist.token,
        dist.user
      );

      const instructionData = Buffer.concat([
        Buffer.from([0]), // Instruction discriminator for distribute_reward
        dist.user.toBuffer(),
        Buffer.from([dist.amount]), // Amount as u64
        dist.token.toBuffer(),
        Buffer.from(dist.reason.padEnd(32, '\0')) // Reason as fixed string
      ]);

      const accounts: AccountMeta[] = [
        { pubkey: userTokenAccount, isSigner: false, isWritable: true },
        { pubkey: dist.user, isSigner: false, isWritable: false },
        { pubkey: dist.token, isSigner: false, isWritable: false },
        { pubkey: payer, isSigner: true, isWritable: true },
        { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        { pubkey: ASSOCIATED_TOKEN_PROGRAM_ID, isSigner: false, isWritable: false }
      ];

      const instruction = new TransactionInstruction({
        keys: accounts,
        programId: this.programId,
        data: instructionData
      });

      transaction.add(instruction);
    }

    return transaction;
  }

  // Claim accumulated rewards
  async claimRewards(
    user: PublicKey,
    tokenMint: PublicKey,
    amount: number
  ): Promise<Transaction> {
    const transaction = new Transaction();

    const userTokenAccount = await getAssociatedTokenAddress(tokenMint, user);
    const [rewardsPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from('rewards'), user.toBuffer(), tokenMint.toBuffer()],
      this.programId
    );

    const instructionData = Buffer.concat([
      Buffer.from([1]), // Instruction discriminator for claim_rewards
      Buffer.from([amount]) // Amount as u64
    ]);

    const accounts: AccountMeta[] = [
      { pubkey: rewardsPDA, isSigner: false, isWritable: true },
      { pubkey: userTokenAccount, isSigner: false, isWritable: true },
      { pubkey: user, isSigner: true, isWritable: false },
      { pubkey: tokenMint, isSigner: false, isWritable: false },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false }
    ];

    const instruction = new TransactionInstruction({
      keys: accounts,
      programId: this.programId,
      data: instructionData
    });

    transaction.add(instruction);
    return transaction;
  }

  // Create staking pool
  async createStakingPool(
    poolAuthority: PublicKey,
    tokenMint: PublicKey,
    rewardRate: number // APY as basis points (e.g., 500 = 5%)
  ): Promise<Transaction> {
    const transaction = new Transaction();

    const [stakingPoolPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from('staking_pool'), tokenMint.toBuffer()],
      this.programId
    );

    const instructionData = Buffer.concat([
      Buffer.from([2]), // Instruction discriminator for create_staking_pool
      tokenMint.toBuffer(),
      Buffer.from([rewardRate]) // Reward rate as u16
    ]);

    const accounts: AccountMeta[] = [
      { pubkey: stakingPoolPDA, isSigner: false, isWritable: true },
      { pubkey: poolAuthority, isSigner: true, isWritable: true },
      { pubkey: tokenMint, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false }
    ];

    const instruction = new TransactionInstruction({
      keys: accounts,
      programId: this.programId,
      data: instructionData
    });

    transaction.add(instruction);
    return transaction;
  }
}

export class NFTProgram {
  constructor(
    private connection: Connection,
    private programId: PublicKey = NFT_PROGRAM_ID
  ) {}

  // Mint Proof of Recycling NFT
  async mintRecyclingNFT(
    user: PublicKey,
    submissionData: {
      weight: number;
      location: string;
      timestamp: number;
      imageHash: string;
    },
    payer: PublicKey
  ): Promise<Transaction> {
    const transaction = new Transaction();

    // Generate NFT mint
    const [nftMintPDA] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('nft_mint'),
        user.toBuffer(),
        Buffer.from(submissionData.timestamp.toString())
      ],
      this.programId
    );

    // User's associated token account for the NFT
    const userTokenAccount = await getAssociatedTokenAddress(nftMintPDA, user);

    // Metadata PDA
    const [metadataPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from('metadata'), nftMintPDA.toBuffer()],
      this.programId
    );

    const instructionData = Buffer.concat([
      Buffer.from([0]), // Instruction discriminator for mint_recycling_nft
      user.toBuffer(),
      Buffer.from([submissionData.weight]),
      Buffer.from(submissionData.location.padEnd(64, '\0')),
      Buffer.from([submissionData.timestamp]),
      Buffer.from(submissionData.imageHash.padEnd(64, '\0'))
    ]);

    const accounts: AccountMeta[] = [
      { pubkey: nftMintPDA, isSigner: false, isWritable: true },
      { pubkey: userTokenAccount, isSigner: false, isWritable: true },
      { pubkey: metadataPDA, isSigner: false, isWritable: true },
      { pubkey: user, isSigner: false, isWritable: false },
      { pubkey: payer, isSigner: true, isWritable: true },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: ASSOCIATED_TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false }
    ];

    const instruction = new TransactionInstruction({
      keys: accounts,
      programId: this.programId,
      data: instructionData
    });

    transaction.add(instruction);
    return transaction;
  }

  // Update NFT metadata (for verification status updates)
  async updateNFTMetadata(
    nftMint: PublicKey,
    authority: PublicKey,
    verified: boolean,
    rewardAmount: number
  ): Promise<Transaction> {
    const transaction = new Transaction();

    const [metadataPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from('metadata'), nftMint.toBuffer()],
      this.programId
    );

    const instructionData = Buffer.concat([
      Buffer.from([1]), // Instruction discriminator for update_nft_metadata
      nftMint.toBuffer(),
      Buffer.from([verified ? 1 : 0]),
      Buffer.from([rewardAmount])
    ]);

    const accounts: AccountMeta[] = [
      { pubkey: metadataPDA, isSigner: false, isWritable: true },
      { pubkey: authority, isSigner: true, isWritable: false },
      { pubkey: nftMint, isSigner: false, isWritable: false }
    ];

    const instruction = new TransactionInstruction({
      keys: accounts,
      programId: this.programId,
      data: instructionData
    });

    transaction.add(instruction);
    return transaction;
  }
}

// Factory class to create program instances
export class ProgramFactory {
  constructor(private connection: Connection) {}

  createPolymersProgram(): PolymersProgram {
    return new PolymersProgram(this.connection);
  }

  createRewardsProgram(): RewardsProgram {
    return new RewardsProgram(this.connection);
  }

  createNFTProgram(): NFTProgram {
    return new NFTProgram(this.connection);
  }
}

// Export program instances
export const createProgramInstances = (connection: Connection) => {
  const factory = new ProgramFactory(connection);
  
  return {
    polymersProgram: factory.createPolymersProgram(),
    rewardsProgram: factory.createRewardsProgram(),
    nftProgram: factory.createNFTProgram(),
  };
};