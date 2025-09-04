import { useState } from "react";
import { motion } from "framer-motion";
import { usePrivy } from "@privy-io/react-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, Mail, Smartphone, ArrowRight, Shield, Zap } from "lucide-react";

interface LoginScreenProps {
  onSuccess: () => void;
}

export function LoginScreen({ onSuccess }: LoginScreenProps) {
  const { login, connectWallet, ready, authenticated } = usePrivy();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleLogin = async () => {
    setIsConnecting(true);
    try {
      await login();
      if (authenticated) {
        onSuccess();
      }
    } catch (error) {
      console.error("Login failed:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleWalletConnect = async () => {
    setIsConnecting(true);
    try {
      await connectWallet();
      onSuccess();
    } catch (error) {
      console.error("Wallet connection failed:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-eco-primary via-eco-success to-eco-primary-light flex items-center justify-center p-4">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Logo Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <div className="w-20 h-20 bg-white rounded-full mx-auto mb-4 flex items-center justify-center shadow-2xl">
            <span className="text-3xl">🌱</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-white/90">Connect to Polymers Network</p>
        </motion.div>

        {/* Login Options */}
        <Card className="bg-white/95 backdrop-blur-lg border-0 shadow-2xl">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-eco-primary">Choose Login Method</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            
            {/* Wallet Connect */}
            <Button
              onClick={handleWalletConnect}
              disabled={!ready || isConnecting}
              className="w-full h-14 bg-gradient-to-r from-eco-primary to-eco-success text-white hover:shadow-lg transition-all duration-300 group"
              size="lg"
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <Wallet size={18} />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold">Connect Wallet</div>
                    <div className="text-xs text-white/80">Solana, Phantom, Backpack</div>
                  </div>
                </div>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Button>

            {/* Social Login */}
            <Button
              onClick={handleLogin}
              disabled={!ready || isConnecting}
              variant="outline"
              className="w-full h-14 border-2 border-eco-primary/20 hover:border-eco-primary hover:bg-eco-primary/5 transition-all duration-300 group"
              size="lg"
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-eco-primary/10 rounded-full flex items-center justify-center">
                    <Mail size={18} className="text-eco-primary" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-eco-primary">Email & Social</div>
                    <div className="text-xs text-muted-foreground">Google, Apple, Twitter</div>
                  </div>
                </div>
                <ArrowRight size={18} className="text-eco-primary group-hover:translate-x-1 transition-transform" />
              </div>
            </Button>

            {/* Features */}
            <div className="pt-4 space-y-3">
              <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                <Shield size={16} className="text-eco-success" />
                <span>Secure & Private Authentication</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                <Zap size={16} className="text-eco-warning" />
                <span>Instant Access to DePIN Rewards</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                <Smartphone size={16} className="text-eco-info" />
                <span>Mobile-Optimized Experience</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <motion.div
          className="text-center mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <p className="text-white/70 text-sm">
            By connecting, you agree to our Terms of Service
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}