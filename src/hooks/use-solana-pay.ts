import { useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { 
  PublicKey, 
  Transaction, 
  SystemProgram,
  LAMPORTS_PER_SOL 
} from '@solana/web3.js';
import { 
  createTransferInstruction,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  getAccount
} from '@solana/spl-token';
import { PaymentRequest, SolanaPayQR } from '@/types/payments';
import { useToast } from '@/hooks/use-toast';

export function useSolanaPay() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const createPaymentRequest = async (
    recipient: string,
    amount: number,
    token: 'SOL' | 'USDC' | 'PLY' = 'SOL',
    memo?: string
  ): Promise<SolanaPayQR | null> => {
    try {
      const recipientPubkey = new PublicKey(recipient);
      const reference = new PublicKey(PublicKey.default);
      
      const searchParams = new URLSearchParams();
      searchParams.set('recipient', recipient);
      searchParams.set('amount', amount.toString());
      if (memo) searchParams.set('memo', memo);
      searchParams.set('reference', reference.toString());
      searchParams.set('label', 'Polymers Network');
      searchParams.set('message', 'Payment for recycling rewards');

      const url = `solana:${recipient}?${searchParams.toString()}`;

      return {
        url,
        qrCode: url, // In a real implementation, this would be a QR code image
        reference,
        recipient: recipientPubkey,
        amount,
        token
      };
    } catch (error) {
      console.error('Failed to create payment request:', error);
      toast({
        title: "Error",
        description: "Failed to create payment request",
        variant: "destructive",
      });
      return null;
    }
  };

  const sendPayment = async (
    recipientAddress: string,
    amount: number,
    token: 'SOL' | 'USDC' | 'PLY' = 'SOL',
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

      if (token === 'SOL') {
        // SOL transfer
        const instruction = SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: recipient,
          lamports: amount * LAMPORTS_PER_SOL,
        });
        transaction.add(instruction);
      } else {
        // SPL Token transfer (USDC, PLY, etc.)
        // This is a simplified implementation - in production, you'd need actual token mint addresses
        const tokenMintAddress = new PublicKey(
          token === 'USDC' 
            ? 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' // USDC mint
            : 'PLY123...' // PLY token mint (placeholder)
        );

        const senderTokenAddress = await getAssociatedTokenAddress(
          tokenMintAddress,
          publicKey
        );

        const recipientTokenAddress = await getAssociatedTokenAddress(
          tokenMintAddress,
          recipient
        );

        // Check if recipient token account exists, create if not
        try {
          await getAccount(connection, recipientTokenAddress);
        } catch (error) {
          // Account doesn't exist, create it
          const createAccountInstruction = createAssociatedTokenAccountInstruction(
            publicKey,
            recipientTokenAddress,
            recipient,
            tokenMintAddress
          );
          transaction.add(createAccountInstruction);
        }

        // Add transfer instruction
        const transferInstruction = createTransferInstruction(
          senderTokenAddress,
          recipientTokenAddress,
          publicKey,
          amount * Math.pow(10, token === 'USDC' ? 6 : 9), // Adjust for token decimals
        );
        transaction.add(transferInstruction);
      }

      // Add memo if provided
      if (memo) {
        // Add memo instruction (simplified)
        console.log('Adding memo:', memo);
      }

      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature);

      toast({
        title: "Success",
        description: `Payment of ${amount} ${token} sent successfully`,
      });

      return signature;
    } catch (error) {
      console.error('Payment failed:', error);
      toast({
        title: "Error",
        description: "Payment failed. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createDonationRequest = async (
    projectId: string,
    amount: number,
    token: 'SOL' | 'USDC' | 'PLY' = 'SOL',
    message?: string
  ) => {
    // Placeholder recipient for donations
    const donationRecipient = 'PolymersNetworkDonations...';
    
    const memo = `Donation to project ${projectId}${message ? `: ${message}` : ''}`;
    
    return createPaymentRequest(donationRecipient, amount, token, memo);
  };

  return {
    createPaymentRequest,
    createDonationRequest,
    sendPayment,
    loading,
  };
}