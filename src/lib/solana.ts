import {
  Connection,
  PublicKey,
  Transaction,
  sendAndConfirmTransaction,
  Keypair,
} from '@solana/web3.js';
import {
  getPythPrice,
  getChainlinkPrice,
  verifyUnitOnChain,
} from './oracles';
import { Unit } from '../types';
import { POLY_TOKEN_MINT, ESCROW_PROGRAM_ID, SOLANA_NETWORK } from '../constants';

// --- Setup connection to Solana ---
const connection = new Connection(SOLANA_NETWORK, 'confirmed');

// --- Example: wallet/keypair for sending transactions ---
export const payer = Keypair.generate(); // Replace with wallet integration (Phantom, Solflare, Backpack)

// === Verify a batch of units using Pyth + Chainlink oracles ===
export const verifyWithOracles = async (units: Unit[]) => {
  const results = await Promise.all(
    units.map(async (unit) => {
      try {
        const pythPrice = await getPythPrice(unit);
        const chainlinkPrice = await getChainlinkPrice(unit);
        return await verifyUnitOnChain(unit, pythPrice, chainlinkPrice);
      } catch (err) {
        console.error('Oracle verification failed for unit', unit.id, err);
        return false;
      }
    })
  );
  return results;
};

// === Send verified batch to Solana program ===
export const sendRecycleTransaction = async (units: Unit[]) => {
  if (units.length === 0) return;

  try {
    const tx = new Transaction();
    // Construct instructions for each unit
    for (const unit of units) {
      // Replace with your Solana program instructions
      // e.g., createAccount, transfer tokens, mint NFT, etc.
    }

    const txSig = await sendAndConfirmTransaction(connection, tx, [payer]);
    console.log('Recycle transaction confirmed:', txSig);
    return txSig;
  } catch (err) {
    console.error('Error sending recycle transaction:', err);
    throw err;
  }
};

// === Release escrow for corporate/NGO donations after batch verification ===
export const releaseEscrow = async (units: Unit[]) => {
  try {
    for (const unit of units) {
      // Build and send escrow release instruction to your custom Solana program
      // Example: release POLY/CRT from escrow account to recipient
    }
    console.log('Escrow released for verified units.');
  } catch (err) {
    console.error('Escrow release failed:', err);
  }
};

// === WebSocket-based real-time leaderboard updates ===
export const subscribeLeaderboard = (
  onUpdate: (leaderboard: any[]) => void
) => {
  // Example using Solana account subscription
  const leaderboardPubkey = new PublicKey('LEADERBOARD_ACCOUNT_PUBKEY'); // Replace with actual account

  const subscriptionId = connection.onAccountChange(
    leaderboardPubkey,
    (accountInfo) => {
      try {
        const data = accountInfo.data; // Deserialize according to your program
        onUpdate(data as any[]);
      } catch (err) {
        console.error('Leaderboard update parsing error:', err);
      }
    }
  );

  return () => {
    connection.removeAccountChangeListener(subscriptionId);
  };
};
