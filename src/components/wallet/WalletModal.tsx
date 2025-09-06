import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletName } from '@solana/wallet-adapter-base';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Wallet, 
  Shield, 
  Zap, 
  ExternalLink, 
  CheckCircle,
  AlertCircle,
  X 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import polymersLogo from '@/assets/polymers-logo.png';

interface WalletModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface WalletInfo {
  name: WalletName;
  icon: string;
  url: string;
  installed: boolean;
  readyState: 'Installed' | 'NotDetected' | 'Loadable' | 'Unsupported';
}

export function WalletModal({ open, onOpenChange }: WalletModalProps) {
  const { wallets, select, connecting, connected } = useWallet();
  const { toast } = useToast();
  const [selectedWallet, setSelectedWallet] = useState<WalletName | null>(null);

  const handleWalletSelect = async (walletName: WalletName) => {
    try {
      setSelectedWallet(walletName);
      select(walletName);
      
      // Close modal on successful connection
      if (connected) {
        onOpenChange(false);
        toast({
          title: "Wallet Connected",
          description: "Successfully connected to your Solana wallet",
        });
      }
    } catch (error) {
      console.error('Wallet connection error:', error);
      toast({
        title: "Connection Failed",
        description: "Failed to connect wallet. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getWalletStatus = (wallet: any): 'installed' | 'detected' | 'notInstalled' => {
    if (wallet.readyState === 'Installed') return 'installed';
    if (wallet.readyState === 'Loadable') return 'detected';
    return 'notInstalled';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'installed': return 'text-eco-success';
      case 'detected': return 'text-eco-warning';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'installed': return <CheckCircle size={16} className="text-eco-success" />;
      case 'detected': return <AlertCircle size={16} className="text-eco-warning" />;
      default: return <ExternalLink size={16} className="text-muted-foreground" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-lg border border-border/50">
        <DialogHeader className="space-y-4">
          {/* Header with Logo */}
          <div className="flex items-center justify-center space-x-3">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-brand-primary/10 p-2">
              <img src={polymersLogo} alt="Polymers" className="w-full h-full object-cover" />
            </div>
            <div className="text-center">
              <DialogTitle className="text-xl font-semibold text-foreground">
                Connect Wallet
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Choose your preferred Solana wallet
              </DialogDescription>
            </div>
          </div>

          {/* Benefits Section */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-brand-secondary/10 rounded-lg">
            <div className="text-center space-y-1">
              <Shield size={20} className="text-brand-primary mx-auto" />
              <p className="text-xs text-muted-foreground">Secure</p>
            </div>
            <div className="text-center space-y-1">
              <Zap size={20} className="text-brand-primary mx-auto" />
              <p className="text-xs text-muted-foreground">Fast</p>
            </div>
            <div className="text-center space-y-1">
              <Wallet size={20} className="text-brand-primary mx-auto" />
              <p className="text-xs text-muted-foreground">Rewards</p>
            </div>
          </div>
        </DialogHeader>

        {/* Wallet List */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground mb-3">
            Available Wallets
          </h4>
          
          <AnimatePresence>
            {wallets.map((wallet) => {
              const status = getWalletStatus(wallet);
              const isConnecting = connecting && selectedWallet === wallet.adapter.name;
              
              return (
                <motion.div
                  key={wallet.adapter.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="w-full"
                >
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => handleWalletSelect(wallet.adapter.name)}
                    disabled={isConnecting}
                    className="w-full justify-between p-4 h-auto border-2 hover:border-brand-primary/50 hover:bg-brand-secondary/5 group transition-all duration-200"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-white p-1 flex items-center justify-center">
                        <img 
                          src={wallet.adapter.icon} 
                          alt={wallet.adapter.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-foreground group-hover:text-brand-primary">
                          {wallet.adapter.name}
                        </p>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(status)}
                          <span className={`text-xs ${getStatusColor(status)}`}>
                            {status === 'installed' && 'Ready to connect'}
                            {status === 'detected' && 'Detected'}
                            {status === 'notInstalled' && 'Not installed'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      {isConnecting ? (
                        <div className="w-5 h-5 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Badge 
                          variant={status === 'installed' ? 'default' : 'secondary'}
                          className={status === 'installed' ? 'bg-brand-primary text-white' : ''}
                        >
                          {status === 'installed' && 'Connect'}
                          {status === 'detected' && 'Load'}
                          {status === 'notInstalled' && 'Install'}
                        </Badge>
                      )}
                    </div>
                  </Button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        <Separator className="my-4" />

        {/* Footer */}
        <div className="text-center space-y-3">
          <p className="text-xs text-muted-foreground">
            New to Solana wallets?{' '}
            <a 
              href="https://docs.solana.com/wallet-guide" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-brand-primary hover:underline"
            >
              Learn more
            </a>
          </p>
          
          <div className="flex items-center justify-center space-x-1 text-xs text-muted-foreground">
            <Shield size={12} />
            <span>Your wallet stays secure and under your control</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}