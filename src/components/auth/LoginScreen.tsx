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
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundImage:
          "url(https://ucarecdn.com/ba8b99b8-fab4-4ceb-b826-d657057c33ec/greenbanner.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundBlendMode: "overlay",
      }}
    >
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="bg-background/95 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-border/40">
          {/* Logo Header */}
          <motion.div
            className="text-center mb-8"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <motion.div
              className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center shadow-xl overflow-hidden relative"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <div className="absolute inset-0 bg-green-700/30 blur-2xl rounded-full" />
              <img
                src="https://ucarecdn.com/d9fddd4a-09d7-49ff-973c-7b8ceeb7ac50/polymerslogo.png"
                alt="Polymers Logo"
                className="w-full h-full object-contain relative z-10"
              />
            </motion.div>
            <h1 className="text-3xl font-bold text-foreground mb-1">
              Polymers Network
            </h1>
            <p className="text-muted-foreground text-sm">
              Connect to start earning <span className="font-semibold">PLY</span>{" "}
              tokens
            </p>
          </motion.div>

          {/* Login Options */}
          <Card className="bg-card/60 backdrop-blur border border-border/40 shadow-lg">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-primary">
                Choose Login Method
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Wallet Connect */}
              <Button
                onClick={handleWalletConnect}
                disabled={!ready || isConnecting}
                className="w-full h-14 bg-green-700 text-white hover:bg-green-800 hover:shadow-lg transition-all duration-300 group border-0 relative"
                size="lg"
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <Wallet size={18} />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold">Connect Wallet</div>
                      <div className="text-xs text-white/80">
                        Solana, Phantom, Backpack
                      </div>
                    </div>
                  </div>
                  {isConnecting ? (
                    <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  ) : (
                    <ArrowRight
                      size={18}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  )}
                </div>
              </Button>

              {/* Social Login */}
              <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
                <Button
                  onClick={handleLogin}
                  disabled={!ready || isConnecting}
                  variant="outline"
                  className="w-full h-14 border-2 border-primary/30 hover:border-primary hover:bg-primary/10 transition-all duration-300 group"
                  size="lg"
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <Mail size={18} className="text-primary" />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-primary">
                          Email & Social
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Google, Apple, Twitter
                        </div>
                      </div>
                    </div>
                    <ArrowRight
                      size={18}
                      className="text-primary group-hover:translate-x-1 transition-transform"
                    />
                  </div>
                </Button>
              </motion.div>

              {/* Features */}
              <div className="pt-4 space-y-3">
                {[
                  { icon: Shield, text: "Secure & Private Authentication" },
                  { icon: Zap, text: "Instant Access to PLY Rewards" },
                  { icon: Smartphone, text: "Mobile-Optimized Experience" },
                ].map(({ icon: Icon, text }, i) => (
                  <motion.div
                    key={i}
                    className="flex items-center space-x-3 text-sm text-muted-foreground"
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                      <Icon size={16} className="text-primary" />
                    </div>
                    <span>{text}</span>
                  </motion.div>
                ))}
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
            <p className="text-muted-foreground text-sm">
              By connecting, you agree to our{" "}
              <a href="/terms" className="text-primary hover:underline">
                Terms of Service
              </a>
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
