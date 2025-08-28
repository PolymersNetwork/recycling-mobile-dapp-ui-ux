import { PublicKey, Transaction, Connection } from '@solana/web3.js';
import { sendTransaction } from './solana';
import { generateUUID } from './utils';
import { Unit } from '../types';

interface Escrow {
  id: string;
  donor: PublicKey;
  recipient: PublicKey;
  amount: number; // in lamports or token smallest units
  units: Unit[];
  released: boolean;
  createdAt: Date;
  releasedAt?: Date;
}

/**
 * Create a new escrow for a batch of recycled units
 */
export const createEscrow = async (
  donor: PublicKey,
  recipient: PublicKey,
  amount: number,
  units: Unit[]
): Promise<Escrow> => {
  const escrow: Escrow = {
    id: generateUUID(),
    donor,
    recipient,
    amount,
    units,
    released: false,
    createdAt: new Date(),
  };

  // Optionally, call your Solana program here to store escrow on-chain
  // await sendTransaction(createEscrowInstruction(escrow));

  return escrow;
};

/**
 * Release escrow automatically after all units are verified
 */
export const releaseEscrow = async (escrow: Escrow): Promise<Escrow> => {
  if (escrow.released) return escrow;

  // 1. Verify all units are approved (on-chain or off-chain verification)
  const allUnitsVerified = escrow.units.every(unit => unit.scannedAt); // stub for demo
  if (!allUnitsVerified) throw new Error('Not all units are verified.');

  // 2. Send Solana transaction to release escrow funds
  const tx: Transaction = new Transaction();
  // TODO: Add your Solana program instruction for escrow release here
  // await sendTransaction(tx);

  // 3. Update escrow status
  escrow.released = true;
  escrow.releasedAt = new Date();

  return escrow;
};

/**
 * Batch release multiple escrows
 */
export const releaseEscrowsBatch = async (escrows: Escrow[]): Promise<Escrow[]> => {
  const releasedEscrows: Escrow[] = [];
  for (const escrow of escrows) {
    if (!escrow.released) {
      const released = await releaseEscrow(escrow);
      releasedEscrows.push(released);
    }
  }
  return releasedEscrows;
};
