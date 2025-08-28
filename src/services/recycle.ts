import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  Keypair,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import { createTransferInstruction, getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { programs } from "@metaplex/js"; // For NFT minting
import { aiService } from "./ai";
import { eventsService } from "./events";
import { rewardsService } from "./rewardsService";
import { createClient } from "@supabase/supabase-js";

const { metadata: { Metadata } } = programs;

interface RecycleUnit {
  id: string;
  type: "plastic" | "metal" | "glass" | "paper";
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
  nftSignatures?: string[];
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export class RecycleService {
  private connection: Connection;
  private programId: PublicKey;

  constructor() {
    this.connection = new Connection(
      process.env.EXPO_PUBLIC_SOLANA_RPC_URL || "https://api.devnet.solana.com",
      "confirmed"
    );
    this.programId = new PublicKey(
      process.env.EXPO_PUBLIC_PROGRAM_ID || "11111111111111111111111111111112"
    );
  }

  /** Scan plastic using AI */
  async scanPlastic(imageData: string, location: { lat: number; lng: number }): Promise<RecycleUnit> {
    const detection = await aiService.detectPlastic(imageData);
    const unit: RecycleUnit = {
      id: `recycle_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      type: detection.type as "plastic",
      weight: detection.estimatedWeight || 0.1,
      location,
      timestamp: Date.now(),
      verified: detection.confidence > 0.8,
    };

    eventsService.track("plastic_scanned", {
      unitId: unit.id,
      type: unit.type,
      confidence: detection.confidence,
      location: unit.location,
    });

    await supabase.from("recycle_units").insert({
      id: unit.id,
      user_wallet: "temp",
      type: unit.type,
      weight: unit.weight,
      location,
      timestamp: unit.timestamp,
      verified: unit.verified,
    });

    return unit;
  }

  /** Submit a batch with SPL rewards and NFT badges */
  async submitRecycleBatch(
    units: RecycleUnit[],
    userWallet: string,
    payerKeypair: Keypair,
    plyMint: PublicKey,
    crtMint: PublicKey
  ): Promise<RecycleResult> {
    const totalWeight = units.reduce((sum, unit) => sum + unit.weight, 0);
    const plyReward = totalWeight * 10;
    const crtReward = totalWeight * 0.5;
    const nftBadges = this.checkNFTMilestones(totalWeight, units.length);

    // Persist recycle units
    await supabase.from("recycle_units").upsert(
      units.map((unit) => ({ ...unit, user_wallet: userWallet })),
      { onConflict: ["id"] }
    );

    // Build transaction
    const transaction = new Transaction();

    // 1️⃣ Transfer SPL tokens (PLY & CRT)
    const userPlyATA = await getAssociatedTokenAddress(plyMint, new PublicKey(userWallet));
    const userCrtATA = await getAssociatedTokenAddress(crtMint, new PublicKey(userWallet));

    transaction.add(
      createTransferInstruction(
        await getAssociatedTokenAddress(plyMint, payerKeypair.publicKey),
        userPlyATA,
        payerKeypair.publicKey,
        BigInt(plyReward * 10 ** 9) // Assuming 9 decimals
      )
    );

    transaction.add(
      createTransferInstruction(
        await getAssociatedTokenAddress(crtMint, payerKeypair.publicKey),
        userCrtATA,
        payerKeypair.publicKey,
        BigInt(crtReward * 10 ** 9)
      )
    );

    // 2️⃣ Add memo for tracking
    transaction.add(
      new TransactionInstruction({
        keys: [],
        programId: new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"),
        data: Buffer.from(`recycle_batch_${Date.now()}`),
      })
    );

    const signature = await sendAndConfirmTransaction(this.connection, transaction, [payerKeypair]);

    // 3️⃣ Mint NFTs for badges
    const nftSignatures: string[] = [];
    for (const badge of nftBadges) {
      const nftSig = await this.mintNFTBadge(userWallet, badge, payerKeypair);
      nftSignatures.push(nftSig);
    }

    // 4️⃣ Log event
    eventsService.track("recycle_batch_submitted", {
      units: units.length,
      totalWeight,
      plyReward,
      crtReward,
      nftBadges,
      signature,
      nftSignatures,
      userWallet,
    });

    // 5️⃣ Update rewards in database
    await rewardsService.addRewards(userWallet, { PLY: plyReward, CRT: crtReward });

    return { plyReward, crtReward, nftBadges, signature, nftSignatures };
  }

  /** Check milestones for NFT badges */
  private checkNFTMilestones(weight: number, count: number): string[] {
    const badges: string[] = [];
    if (weight >= 1.0) badges.push("first_kg");
    if (count >= 10) badges.push("ten_items");
    if (weight >= 10.0) badges.push("eco_warrior");
    return badges;
  }

  /** Mint NFT badge using Metaplex Token Metadata program */
  private async mintNFTBadge(userWallet: string, badgeType: string, payerKeypair: Keypair): Promise<string> {
    const mint = Keypair.generate();
    const userPubkey = new PublicKey(userWallet);

    const metadataData = {
      name: `EcoBadge - ${badgeType}`,
      symbol: "ECO",
      uri: `https://metadata-server.example.com/badges/${badgeType}.json`,
      sellerFeeBasisPoints: 0,
      creators: [
        { address: payerKeypair.publicKey.toBase58(), verified: true, share: 100 },
      ],
    };

    const tx = new Transaction();

    // Create NFT mint
    tx.add(
      SystemProgram.createAccount({
        fromPubkey: payerKeypair.publicKey,
        newAccountPubkey: mint.publicKey,
        space: 82,
        lamports: await this.connection.getMinimumBalanceForRentExemption(82),
        programId: TOKEN_PROGRAM_ID,
      })
    );

    // Mint 1 token to user
    const userATA = await getAssociatedTokenAddress(mint.publicKey, userPubkey);
    tx.add(
      createTransferInstruction(
        await getAssociatedTokenAddress(mint.publicKey, payerKeypair.publicKey),
        userATA,
        payerKeypair.publicKey,
        BigInt(1)
      )
    );

    // Create Metadata
    tx.add(
      Metadata.createCreateMetadataAccountV2Instruction(
        {
          metadata: await Metadata.getPDA(mint.publicKey),
          mint: mint.publicKey,
          mintAuthority: payerKeypair.publicKey,
          payer: payerKeypair.publicKey,
          updateAuthority: payerKeypair.publicKey,
        },
        { createMetadataAccountArgsV2: { data: metadataData, isMutable: true } }
      )
    );

    const sig = await sendAndConfirmTransaction(this.connection, tx, [payerKeypair, mint]);
    return sig;
  }

  async getRecycleHistory(userWallet: string): Promise<RecycleUnit[]> {
    const { data } = await supabase.from("recycle_units").select("*").eq("user_wallet", userWallet);
    return data || [];
  }

  async getLeaderboard(): Promise<Array<{ wallet: string; totalWeight: number; rank: number }>> {
    const { data } = await supabase
      .from("recycle_units")
      .select("user_wallet, sum(weight) as totalWeight")
      .group("user_wallet")
      .order("totalWeight", { ascending: false });

    if (!data) return [];

    return data.map((row: any, index: number) => ({
      wallet: row.user_wallet,
      totalWeight: row.totalWeight,
      rank: index + 1,
    }));
  }
}

export const recycleService = new RecycleService();
