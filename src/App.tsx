import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PolymersWalletProvider } from "@/providers/WalletProvider";
import { BlockchainProvider } from "@/contexts/BlockchainContext";
import { SplashScreen } from "@/components/SplashScreen";
import { LoginScreen } from "@/components/auth/LoginScreen";
import { BottomNav } from "@/components/mobile/BottomNav";
import { Home } from "@/pages/mobile/Home";
import { Scan } from "@/pages/mobile/Scan";
import { Projects } from "@/pages/mobile/Projects";
import { Portfolio } from "@/pages/mobile/Portfolio";
import { Settings } from "@/pages/mobile/Settings";
import { Marketplace } from "@/pages/mobile/Marketplace";
import { Profile } from "@/pages/mobile/Profile";
import NotFound from "@/pages/NotFound";
import Index from "@/pages/Index";

const queryClient = new QueryClient();

const App = () => {
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <PolymersWalletProvider>
      <BlockchainProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <div className="min-h-screen bg-background">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<LoginScreen />} />
                  <Route path="/home" element={<Home />} />
                  <Route path="/scan" element={<Scan />} />
                  <Route path="/projects" element={<Projects />} />
                  <Route path="/marketplace" element={<Marketplace />} />
                  <Route path="/portfolio" element={<Portfolio />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
                <BottomNav />
              </div>
            </BrowserRouter>
          </TooltipProvider>
        </QueryClientProvider>
      </BlockchainProvider>
    </PolymersWalletProvider>
  );
};

export default App;
