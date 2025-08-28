import {
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import { PythConnection } from '@pythnetwork/client';
import { getChainlinkPriceFeed } from '@chainlink/contracts';
import { API_BASE_URL } from '../constants';
import axios from 'axios';
import { Unit } from '../context/RecyclingContext';

const SOLANA_RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com';
const PROGRAM_ID = new PublicKey(process.env.NEXT_PUBLIC_SOLANA_PROGRAM_ID!);

const connection = new Connection(SOLANA_RPC_URL, 'confirmed');

// === Pyth Oracle Verification ===
export const getPythPrice = async (productPubKey: string): Promise<number> => {
  const pyth = new PythConnection(connection);
  await pyth.connect();
  const priceData = await pyth.getPrice(new PublicKey(productPubKey));
  return priceData?.price ?? 0;
};

// === Chainlink Oracle Verification ===
export const getChainlinkPrice = async (feedAddress: string): Promise<number> => {
  return await getChainlinkPriceFeed(feedAddress, connection);
};

// === Verify a batch of units with on-chain oracles ===
export const verifyWithOracles = async (units: Unit[]): Promise<boolean[]> => {
  const results: boolean[] = [];
  for (const unit of units) {
    try {
      // Replace these with your actual product feed keys per unit
      const pythPrice = await getPythPrice(unit.city); // placeholder
      const chainlinkPrice = await getChainlinkPrice(unit.city); // placeholder

      // Example verification logic
      results.push(pythPrice > 0 && chainlinkPrice > 0);
    } catch {
      results.push(false);
    }
  }
  return results;
};

// === Send Recycle Transaction ===
export const sendRecycleTransaction = async (units: Unit[]) => {
  const tx = new Transaction();
  const instructions: TransactionInstruction[] = units.map(unit => {
    return new TransactionInstruction({
      keys: [
        { pubkey: new PublicKey(unit.city), isSigner: false, isWritable: true },
      ],
      programId: PROGRAM_ID,
      data: Buffer.from(JSON.stringify(unit)), // adapt to your program schema
    });
  });

  tx.add(...instructions);
  const signature = await sendAndConfirmTransaction(connection, tx, []); // add signer(s)
  console.log('Recycle transaction confirmed:', signature);
  return signature;
};

// === Release Escrow for Corporate/NGO donations ===
export const releaseEscrow = async (units: Unit[]) => {
  try {
    await axios.post(`${API_BASE_URL}/escrow/release`, { units });
    console.log('Escrow released for verified batch.');
  } catch (error) {
    console.error('Failed to release escrow:', error);
  }
};

// === WebSocket subscription for real-time leaderboard updates ===
export const subscribeLeaderboard = (callback: (data: any[]) => void) => {
  const ws = new WebSocket(`${API_BASE_URL.replace(/^http/, 'ws')}/leaderboard/ws`);

  ws.onopen = () => console.log('Leaderboard WS connected');
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    callback(data);
  };
  ws.onclose = () => console.log('Leaderboard WS disconnected');
  ws.onerror = (err) => console.error('Leaderboard WS error:', err);

  return ws; // allows caller to close subscription later
};
