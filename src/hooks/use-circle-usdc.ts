import { useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { 
  PublicKey, 
  Transaction,
  SystemProgram 
} from '@solana/web3.js';
import { 
  createTransferInstruction,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  getAccount,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID
} from '@solana/spl-token';
import { useToast } from '@/hooks/use-toast';

// USDC Mint Address on Solana
const USDC_MINT = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');
const USDC_DECIMALS = 6;

interface USDCBalance {
  amount: number;
  uiAmount: number;
  formatted: string;
}

interface USDCTransaction {
  signature: string;
  amount: number;
  type: 'send' | 'receive';
  timestamp: number;
  status: 'confirmed' | 'pending' | 'failed';
}

export function useCircleUSDC() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const getUSDCBalance = async (): Promise<USDCBalance | null> => {
    if (!publicKey) return null;

    try {
      const tokenAccount = await getAssociatedTokenAddress(
        USDC_MINT,
        publicKey
      );

      const account = await getAccount(connection, tokenAccount);
      const amount = Number(account.amount);
      const uiAmount = amount / Math.pow(10, USDC_DECIMALS);

      return {
        amount,
        uiAmount,
        formatted: uiAmount.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 6
        })
      };
    } catch (error) {
      // Token account doesn't exist or other error
      console.log('USDC token account not found or error:', error);
      return {
        amount: 0,
        uiAmount: 0,
        formatted: '0.00'
      };
    }
  };

  const sendUSDC = async (
    recipientAddress: string,
    amount: number,
    memo?: string
  ): Promise<string | null> => {
    if (!publicKey) {
      toast({
        title: "Error",
        description: "Wallet not connected",
        variant: "destructive",
      });
      return null;
    }

    setLoading(true);
    try {
      const transaction = new Transaction();
      const recipient = new PublicKey(recipientAddress);

      // Get sender's USDC token account
      const senderTokenAccount = await getAssociatedTokenAddress(
        USDC_MINT,
        publicKey
      );

      // Get recipient's USDC token account
      const recipientTokenAccount = await getAssociatedTokenAddress(
        USDC_MINT,
        recipient
      );

      // Check if recipient token account exists, create if not
      try {
        await getAccount(connection, recipientTokenAccount);
      } catch (error) {
        // Account doesn't exist, create it
        const createAccountInstruction = createAssociatedTokenAccountInstruction(
          publicKey, // payer
          recipientTokenAccount, // associated token account
          recipient, // owner
          USDC_MINT, // mint
          TOKEN_PROGRAM_ID,
          ASSOCIATED_TOKEN_PROGRAM_ID
        );
        transaction.add(createAccountInstruction);
      }

      // Add transfer instruction
      const transferAmount = amount * Math.pow(10, USDC_DECIMALS);
      const transferInstruction = createTransferInstruction(
        senderTokenAccount,
        recipientTokenAccount,
        publicKey,
        transferAmount
      );
      transaction.add(transferInstruction);

      // Add memo if provided
      if (memo) {
        // In a real implementation, add memo instruction
        console.log('Memo:', memo);
      }

      const signature = await sendTransaction(transaction, connection);
      
      // Wait for confirmation
      const confirmation = await connection.confirmTransaction(signature, 'confirmed');
      
      if (confirmation.value.err) {
        throw new Error('Transaction failed');
      }

      toast({
        title: "Success",
        description: `Sent ${amount} USDC successfully`,
      });

      return signature;
    } catch (error) {
      console.error('USDC transfer failed:', error);
      toast({
        title: "Error",
        description: "USDC transfer failed. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const receiveUSDC = async (amount: number): Promise<string> => {
    if (!publicKey) {
      throw new Error('Wallet not connected');
    }

    // Generate a Solana Pay URL for USDC
    const searchParams = new URLSearchParams();
    searchParams.set('recipient', publicKey.toString());
    searchParams.set('amount', amount.toString());
    searchParams.set('spl-token', USDC_MINT.toString());
    searchParams.set('reference', PublicKey.default.toString());
    searchParams.set('label', 'Polymers Network USDC Payment');
    searchParams.set('message', 'USDC payment for recycling rewards');

    return `solana:${publicKey.toString()}?${searchParams.toString()}`;
  };

  const getUSDCTransactionHistory = async (limit: number = 50): Promise<USDCTransaction[]> => {
    if (!publicKey) return [];

    try {
      const tokenAccount = await getAssociatedTokenAddress(
        USDC_MINT,
        publicKey
      );

      // Get transaction signatures for the token account
      const signatures = await connection.getSignaturesForAddress(
        tokenAccount,
        { limit }
      );

      const transactions: USDCTransaction[] = [];

      for (const sig of signatures) {
        try {
          const tx = await connection.getParsedTransaction(sig.signature);
          if (!tx) continue;

          // Parse USDC transfers from the transaction
          const instructions = tx.transaction.message.instructions;
          
          for (const instruction of instructions) {
            if ('parsed' in instruction && instruction.parsed?.type === 'transfer') {
              const info = instruction.parsed.info;
              if (info.mint === USDC_MINT.toString()) {
                const amount = parseFloat(info.tokenAmount.uiAmountString || '0');
                const isReceive = info.destination === tokenAccount.toString();
                
                transactions.push({
                  signature: sig.signature,
                  amount,
                  type: isReceive ? 'receive' : 'send',
                  timestamp: (sig.blockTime || 0) * 1000,
                  status: sig.confirmationStatus === 'confirmed' ? 'confirmed' : 'pending'
                });
              }
            }
          }
        } catch (error) {
          console.error('Failed to parse transaction:', error);
        }
      }

      return transactions.sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      console.error('Failed to fetch USDC transaction history:', error);
      return [];
    }
  };

  const createUSDCPaymentRequest = (
    amount: number,
    recipient?: string,
    memo?: string
  ) => {
    const recipientAddress = recipient || publicKey?.toString();
    if (!recipientAddress) {
      throw new Error('No recipient address provided');
    }

    const searchParams = new URLSearchParams();
    searchParams.set('recipient', recipientAddress);
    searchParams.set('amount', amount.toString());
    searchParams.set('spl-token', USDC_MINT.toString());
    searchParams.set('reference', PublicKey.default.toString());
    searchParams.set('label', 'Polymers Network');
    if (memo) searchParams.set('memo', memo);

    return {
      url: `solana:${recipientAddress}?${searchParams.toString()}`,
      qrData: `solana:${recipientAddress}?${searchParams.toString()}`,
      amount,
      token: 'USDC',
      recipient: recipientAddress
    };
  };

  const estimateUSDCTransferFee = async (): Promise<number> => {
    try {
      // Get recent blockhash to estimate fee
      const { feeCalculator } = await connection.getRecentBlockhash();
      return feeCalculator.lamportsPerSignature / 1e9; // Convert to SOL
    } catch (error) {
      console.error('Failed to estimate transfer fee:', error);
      return 0.000005; // Default SOL fee estimate
    }
  };

  return {
    getUSDCBalance,
    sendUSDC,
    receiveUSDC,
    getUSDCTransactionHistory,
    createUSDCPaymentRequest,
    estimateUSDCTransferFee,
    loading,
    USDC_MINT: USDC_MINT.toString()
  };
}