import { PublicKey, Transaction, sendAndConfirmTransaction } from '@solana/web3.js';
import { program } from './solana';

/**
 * Create a new escrow account for a batch
 */
export const createEscrow = async (payer: PublicKey, recipient: PublicKey) => {
  const tx = new Transaction();
  tx.add(
    program.instruction.createEscrow({
      accounts: {
        payer,
        recipient,
        escrowAccount: PublicKey.default, // to be generated dynamically
        systemProgram: PublicKey.default,
      },
    })
  );
  const sig = await sendAndConfirmTransaction(program.provider.connection, tx, []);
  return sig;
};

/**
 * Release escrow after batch verification
 */
export const releaseEscrowForBatch = async (
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
  const sig = await sendAndConfirmTransaction(program.provider.connection, tx, []);
  return sig;
};

/**
 * Refund escrow if batch fails verification
 */
export const refundEscrow = async (escrowAccount: PublicKey, payer: PublicKey) => {
  const tx = new Transaction();
  tx.add(
    program.instruction.refundEscrow({
      accounts: {
        escrowAccount,
        payer,
        systemProgram: PublicKey.default,
      },
    })
  );
  const sig = await sendAndConfirmTransaction(program.provider.connection, tx, []);
  return sig;
};
