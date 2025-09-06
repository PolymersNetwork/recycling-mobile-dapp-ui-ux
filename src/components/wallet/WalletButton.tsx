import { useState } from "react";
import { useWallet } from '@solana/wallet-adapter-react';
import { usePrivy } from "@privy-io/react-auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Wallet, Copy, ExternalLink, LogOut, Settings, Coins, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { WalletModal } from "./WalletModal";
import polymersLogo from '@/assets/polymers-logo.png';

export function WalletButton() {
  const { publicKey, connected, connecting, disconnect } = useWallet();
  const { user, logout, connectWallet, ready, authenticated } = usePrivy();
  const { toast } = useToast();
  const [isConnecting, setIsConnecting] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);

  const handleConnect = () => {
    setShowWalletModal(true);
  };

  const handleDisconnect = async () => {
    try {
      if (connected && disconnect) {
        await disconnect();
      }
      if (authenticated && logout) {
        await logout();
      }
      toast({
        title: "Wallet Disconnected",
        description: "Successfully disconnected wallet",
      });
    } catch (error) {
      console.error("Disconnect failed:", error);
      toast({
        title: "Disconnect Failed",
        description: "Failed to disconnect wallet",
        variant: "destructive"
      });
    }
  };

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    toast({
      title: "Address Copied",
      description: "Wallet address copied to clipboard",
    });
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const getUserEmail = () => {
    if (user?.email) {
      if (typeof user.email === 'string') {
        return user.email;
      }
      return user.email.address || 'user@example.com';
    }
    return 'user@example.com';
  };

  const getUserInitials = () => {
    const email = getUserEmail();
    return email.slice(0, 2).toUpperCase();
  };

  if (!connected && !authenticated) {
    return (
      <>
        <Button 
          onClick={handleConnect}
          disabled={connecting}
          variant="wallet"
          size="default"
          className="font-medium"
        >
          <Wallet size={18} className="mr-2" />
          {connecting ? 'Connecting...' : 'Connect Wallet'}
        </Button>
        <WalletModal 
          open={showWalletModal} 
          onOpenChange={setShowWalletModal} 
        />
      </>
    );
  }

  const walletAddress = publicKey?.toString() || user?.wallet?.address;
  const hasWallet = connected || !!walletAddress;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="wallet-outline" 
          size="default"
          className="min-w-[140px] font-medium"
        >
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Avatar className="w-7 h-7 border-2 border-brand-primary/20">
                <AvatarFallback className="bg-brand-primary text-white text-xs font-medium">
                  {hasWallet ? (
                    <img src={polymersLogo} alt="PLY" className="w-4 h-4" />
                  ) : (
                    <User size={14} />
                  )}
                </AvatarFallback>
              </Avatar>
              {hasWallet && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-eco-success rounded-full border-2 border-background" />
              )}
            </div>
            <div className="flex flex-col items-start min-w-0">
              {hasWallet ? (
                <>
                  <span className="text-xs font-medium text-brand-primary hidden sm:block">
                    {formatAddress(walletAddress)}
                  </span>
                  <Badge variant="secondary" className="bg-eco-success/20 text-eco-success text-[10px] px-1 py-0 h-4">
                    Connected
                  </Badge>
                </>
              ) : (
                <span className="text-sm font-medium">Account</span>
              )}
            </div>
          </div>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 bg-card/95 backdrop-blur-lg border-border/50 shadow-xl">
        {/* User Info */}
        <div className="p-4 border-b border-border/50">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Avatar className="w-12 h-12 border-2 border-brand-primary/20">
                <AvatarFallback className="bg-brand-primary text-white text-lg font-semibold">
                  {hasWallet ? (
                    <img src={polymersLogo} alt="PLY" className="w-6 h-6" />
                  ) : (
                    getUserInitials()
                  )}
                </AvatarFallback>
              </Avatar>
              {hasWallet && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-eco-success rounded-full border-2 border-card flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-foreground truncate">
                {getUserEmail()}
              </p>
              {hasWallet && (
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-xs text-muted-foreground font-mono bg-muted/50 px-2 py-1 rounded">
                    {formatAddress(walletAddress)}
                  </span>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    className="hover:bg-brand-secondary/20 hover:text-brand-primary"
                    onClick={() => copyAddress(walletAddress)}
                  >
                    <Copy size={12} />
                  </Button>
                </div>
              )}
              <Badge 
                variant="secondary" 
                className={`mt-2 text-xs ${hasWallet ? 'bg-eco-success/20 text-eco-success' : 'bg-muted text-muted-foreground'}`}
              >
                {hasWallet ? 'Wallet Connected' : 'No Wallet'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Wallet Actions */}
        {hasWallet && (
          <>
            <DropdownMenuItem className="hover:bg-brand-secondary/20 hover:text-brand-primary py-3">
              <Coins size={18} className="mr-3 text-brand-primary" />
              <div className="flex flex-col">
                <span className="font-medium">View Portfolio</span>
                <span className="text-xs text-muted-foreground">Check your PLY rewards</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="hover:bg-brand-secondary/20 hover:text-brand-primary py-3"
              onClick={() => window.open(`https://solscan.io/account/${walletAddress}`, '_blank')}
            >
              <ExternalLink size={18} className="mr-3 text-brand-primary" />
              <div className="flex flex-col">
                <span className="font-medium">View on Explorer</span>
                <span className="text-xs text-muted-foreground">Solscan blockchain explorer</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border/50" />
          </>
        )}

        {/* Connect Wallet */}
        {!hasWallet && (
          <>
            <DropdownMenuItem onClick={handleConnect} className="hover:bg-brand-secondary/20 hover:text-brand-primary py-3">
              <Wallet size={18} className="mr-3 text-brand-primary" />
              <div className="flex flex-col">
                <span className="font-medium">Connect Wallet</span>
                <span className="text-xs text-muted-foreground">Link your Solana wallet</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border/50" />
          </>
        )}

        {/* Settings */}
        <DropdownMenuItem className="hover:bg-brand-secondary/20 hover:text-brand-primary py-3">
          <Settings size={18} className="mr-3 text-brand-primary" />
          <div className="flex flex-col">
            <span className="font-medium">Settings</span>
            <span className="text-xs text-muted-foreground">Account preferences</span>
          </div>
        </DropdownMenuItem>

        {/* Logout */}
        <DropdownMenuSeparator className="bg-border/50" />
        <DropdownMenuItem 
          onClick={handleDisconnect}
          className="text-destructive hover:bg-destructive/10 hover:text-destructive py-3"
        >
          <LogOut size={18} className="mr-3" />
          <div className="flex flex-col">
            <span className="font-medium">Disconnect</span>
            <span className="text-xs text-muted-foreground">Sign out from wallet</span>
          </div>
        </DropdownMenuItem>

        <WalletModal 
          open={showWalletModal} 
          onOpenChange={setShowWalletModal} 
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}