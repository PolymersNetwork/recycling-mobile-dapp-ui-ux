import { useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, Smartphone, ArrowRight, Shield, Zap } from "lucide-react";
import polymersLogo from '@/assets/polymers-logo.png';

export function LoginScreen() {
  const { connected } = useWallet();
  const navigate = useNavigate();

  useEffect(() => {
    if (connected) {
      navigate('/home');
    }
  }, [connected, navigate]);

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-eco-primary via-background to-eco-primary/50 flex items-center justify-center p-4"
      style={{
        backgroundImage: 'url(/lovable-uploads/7acece68-7f1a-488d-8487-6cdf3c125a27.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundBlendMode: 'overlay'
      }}
    >
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="bg-background/95 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-border/50">
          {/* Logo Header */}
          <motion.div
            className="text-center mb-8"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center shadow-2xl overflow-hidden">
              <img src={polymersLogo} alt="Polymers Network" className="w-full h-full object-cover" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Polymers Network</h1>
            <p className="text-muted-foreground">Connect your Solana wallet to continue</p>
          </motion.div>

          {/* Login Options */}
          <Card className="bg-card/50 backdrop-blur border border-border/50 shadow-lg">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-primary">Connect Wallet</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Wallet Connect */}
              <div className="flex justify-center">
                <WalletMultiButton className="!bg-gradient-to-r !from-eco-primary !via-eco-primary/90 !to-eco-primary/80 !text-white hover:!shadow-lg !transition-all !duration-300 !border-0 !px-8 !py-4 !text-lg !font-semibold !h-auto !rounded-lg" />
              </div>

              {/* Features */}
              <div className="pt-4 space-y-3">
                <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                  <Shield size={16} className="text-eco-primary" />
                  <span>Secure Solana Wallet Integration</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                  <Zap size={16} className="text-eco-primary" />
                  <span>Instant Access to PLY Rewards</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                  <Smartphone size={16} className="text-eco-primary" />
                  <span>Mobile-Optimized Experience</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                  <Wallet size={16} className="text-eco-primary" />
                  <span>Phantom, Solflare, Backpack Supported</span>
                </div>
              </div>

              {/* Back to Home */}
              <Button
                onClick={() => navigate('/')}
                variant="outline"
                className="w-full border-eco-primary/20 text-eco-primary hover:bg-eco-primary/5"
              >
                Back to Home
              </Button>
            </CardContent>
          </Card>

          {/* Footer */}
          <motion.div
            className="text-center mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <p className="text-muted-foreground text-sm">
              By connecting, you agree to our Terms of Service
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}