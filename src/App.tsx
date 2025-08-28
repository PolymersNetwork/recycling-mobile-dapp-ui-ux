import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { ThemeProvider } from "@/theme/theme";
import { RecyclingProvider } from "@/contexts/RecyclingContext";

import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";

import { BottomNav } from "@/components/mobile/BottomNav";
import { MobileHeader } from "@/components/mobile/MobileHeader";

import { Start } from "@/pages/Start";
import { Home } from "@/pages/mobile/Home";
import { Scan } from "@/pages/mobile/Scan";
import { RecycleScreen } from "@/pages/mobile/RecycleScreen";
import { Projects } from "@/pages/mobile/Projects";
import { Portfolio } from "@/pages/mobile/Portfolio";
import { Profile } from "@/pages/mobile/Profile";
import { Marketplace } from "@/pages/mobile/Marketplace";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <RecyclingProvider>
            <BrowserRouter>
              <div className="relative min-h-screen pb-16 bg-background dark:bg-background-dark">
                {/* MobileHeader can dynamically update based on route */}
                <MobileHeader title="Polymers" showNotifications showSettings />

                <Routes>
                  <Route path="/start" element={<Start />} />
                  <Route path="/" element={<Home />} />
                  <Route path="/scan" element={<Scan />} />
                  <Route path="/recycle" element={<RecycleScreen />} />
                  <Route path="/projects" element={<Projects />} />
                  <Route path="/marketplace" element={<Marketplace />} />
                  <Route path="/portfolio" element={<Portfolio />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>

                {/* Persistent Bottom Navigation */}
                <BottomNav />
              </div>
            </BrowserRouter>
          </RecyclingProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
