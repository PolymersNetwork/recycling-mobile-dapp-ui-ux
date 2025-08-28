import {
  Connection,
  PublicKey,
  Transaction,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import { AnchorProvider, Program, Idl } from '@project-serum/anchor';
import { EventEmitter } from 'events';
import { ESCROW_PROGRAM_ID, RECYCLE_PROGRAM_ID, SOLANA_NETWORK } from '../constants';
import { getPythPrice, getChainlinkPrice } from './oracles';

// Solana connection & provider
const connection = new Connection(SOLANA_NETWORK, 'confirmed');
const provider = AnchorProvider.local(SOLANA_NETWORK);
const program = new Program<Idl>({} as Idl, RECYCLE_PROGRAM_ID, provider);

// Event emitter for real-time updates
export const leaderboardEmitter = new EventEmitter();

/**
 * Submit a batch of recycling units to Solana program
 */
export const sendRecycleTransaction = async (
  userPublicKey: PublicKey,
  batchUnits: Array<{ id: string; location: string; weight: number }>
) => {
  const tx = new Transaction();
  // Add instructions for each unit
  batchUnits.forEach((unit) => {
    tx.add(
      program.instruction.logRecycling(unit.weight, {
        accounts: {
          user: userPublicKey,
          recycleRecord: new PublicKey(unit.id),
          systemProgram: PublicKey.default,
        },
      })
    );
  });

  // Send transaction
  const txSig = await sendAndConfirmTransaction(connection, tx, []);
  return txSig;
};

/**
 * Verify a single recycling unit with Pyth + Chainlink oracles
 */
export const verifyUnitOracle = async (unitId: string) => {
  const pythPrice = await getPythPrice(unitId);
  const chainlinkPrice = await getChainlinkPrice(unitId);

  // Example verification logic
  return Math.abs(pythPrice - chainlinkPrice) < 0.001;
};

/**
 * Release escrow for a batch once verification completes
 */
export const releaseEscrow = async (
  escrowAccount: PublicKey,
  recipient: PublicKey
) => {
  const tx = new Transaction();
  tx.add(
    program.instruction.releaseEscrow({
      accounts: {
        escrowAccount,
        recipient,
        systemProgram: PublicKey.default,
      },
    })
  );
  const sig = await sendAndConfirmTransaction(connection, tx, []);
  return sig;
};

/**
 * Subscribe to real-time leaderboard updates via WebSocket
 */
export const subscribeLeaderboard = (callback: (data: any) => void) => {
  const subId = connection.onAccountChange(
    new PublicKey(RECYCLE_PROGRAM_ID),
    (accountInfo) => {
      const leaderboardData = accountInfo.data; // parse as needed
      callback(leaderboardData);
      leaderboardEmitter.emit('update', leaderboardData);
    }
  );
  return subId;
};

/**
 * Unsubscribe leaderboard updates
 */
export const unsubscribeLeaderboard = (subId: number) => {
  connection.removeAccountChangeListener(subId);
};
