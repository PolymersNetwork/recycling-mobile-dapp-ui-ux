import { useState } from "react";
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
import { Wallet, Copy, ExternalLink, LogOut, Settings, Coins } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function WalletButton() {
  const { user, logout, connectWallet, ready, authenticated } = usePrivy();
  const { toast } = useToast();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await connectWallet();
    } catch (error) {
      console.error("Connection failed:", error);
      toast({
        title: "Connection Failed",
        description: "Failed to connect wallet. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsConnecting(false);
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

  if (!ready || !authenticated) {
    return (
      <Button 
        onClick={handleConnect}
        disabled={isConnecting}
        variant="outline"
        size="sm"
        className="border-eco-primary/20 hover:border-eco-primary hover:bg-eco-primary/5"
      >
        <Wallet size={16} className="mr-2" />
        Connect Wallet
      </Button>
    );
  }

  const walletAddress = user?.wallet?.address;
  const hasWallet = !!walletAddress;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="border-eco-primary/20 hover:border-eco-primary hover:bg-eco-primary/5"
        >
          <div className="flex items-center space-x-2">
            <Avatar className="w-6 h-6">
              <AvatarFallback className="bg-eco-primary text-white text-xs">
                {getUserInitials()}
              </AvatarFallback>
            </Avatar>
            {hasWallet ? (
              <>
                <span className="hidden sm:inline">{formatAddress(walletAddress)}</span>
                <Badge variant="secondary" className="bg-eco-success/20 text-eco-success text-xs">
                  Connected
                </Badge>
              </>
            ) : (
              <span className="text-sm">Account</span>
            )}
          </div>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-72">
        {/* User Info */}
        <div className="p-4 border-b">
          <div className="flex items-center space-x-3">
            <Avatar className="w-10 h-10">
              <AvatarFallback className="bg-eco-primary text-white">
                {getUserInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">
                {getUserEmail()}
              </p>
              {hasWallet && (
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-xs text-muted-foreground font-mono">
                    {formatAddress(walletAddress)}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-5 w-5 p-0 hover:bg-eco-primary/10"
                    onClick={() => copyAddress(walletAddress)}
                  >
                    <Copy size={10} />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Wallet Actions */}
        {hasWallet && (
          <>
            <DropdownMenuItem className="hover:bg-eco-primary/5">
              <Coins size={16} className="mr-3 text-eco-primary" />
              View Portfolio
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="hover:bg-eco-primary/5"
              onClick={() => window.open(`https://solscan.io/account/${walletAddress}`, '_blank')}
            >
              <ExternalLink size={16} className="mr-3 text-eco-primary" />
              View on Explorer
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}

        {/* Connect Wallet */}
        {!hasWallet && (
          <>
            <DropdownMenuItem onClick={handleConnect} className="hover:bg-eco-primary/5">
              <Wallet size={16} className="mr-3 text-eco-primary" />
              Connect Wallet
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}

        {/* Settings */}
        <DropdownMenuItem className="hover:bg-eco-primary/5">
          <Settings size={16} className="mr-3 text-eco-primary" />
          Settings
        </DropdownMenuItem>

        {/* Logout */}
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={logout}
          className="text-red-600 hover:bg-red-50 hover:text-red-700"
        >
          <LogOut size={16} className="mr-3" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}