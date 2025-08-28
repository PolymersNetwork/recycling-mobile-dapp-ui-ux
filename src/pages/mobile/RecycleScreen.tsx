import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import Confetti from "react-confetti";
import useSound from "use-sound";
import { MobileHeader } from "@/components/mobile/MobileHeader";
import { EcoButton } from "@/components/ui/eco-button";
import { EcoCard, EcoCardContent, EcoCardHeader, EcoCardTitle } from "@/components/ui/eco-card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Camera, Upload, Zap, CheckCircle, Loader2, QrCode, Wifi } from "lucide-react";
import scanSuccessSound from "@/assets/sounds/scan-success.mp3";

// --------------------- Context ---------------------
interface BadgeType {
  id: string;
  name: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  description?: string;
  unlocked: boolean;
}

interface CityMetric {
  plyEarned: number;
  crtEarned: number;
  forecast?: { ply: number; crt: number };
}

interface RecyclingContextType {
  plyBalance: number;
  crtBalance: number;
  units: number;
  badges: BadgeType[];
  cityMetrics: Record<string, CityMetric>;
  logRecycleUnit: (unit: { city: string; lat: number; lng: number }) => void;
  submitBatch: () => void;
  connectWallet: () => void;
  walletConnected: boolean;
}

const RecyclingContext = createContext<RecyclingContextType | undefined>(undefined);

export function RecyclingProvider({ children }: { children: ReactNode }) {
  const [plyBalance, setPlyBalance] = useState(500);
  const [crtBalance, setCrtBalance] = useState(50);
  const [units, setUnits] = useState(0);
  const [walletConnected, setWalletConnected] = useState(false);
  const [badges, setBadges] = useState<BadgeType[]>([
    { id: "b1", name: "Recycler", rarity: "common", unlocked: true },
    { id: "b2", name: "Eco Hero", rarity: "rare", unlocked: false },
    { id: "b3", name: "Planet Saver", rarity: "epic", unlocked: false },
  ]);
  const [cityMetrics, setCityMetrics] = useState<Record<string, CityMetric>>({
    "San Francisco": { plyEarned: 120, crtEarned: 10, forecast: { ply: 200, crt: 20 } },
    "New York": { plyEarned: 80, crtEarned: 5, forecast: { ply: 150, crt: 15 } },
  });

  const logRecycleUnit = (unit: { city: string; lat: number; lng: number }) => {
    setUnits(u => u + 1);
    setPlyBalance(p => p + 10);
    setCrtBalance(c => c + 1);

    // Update city metrics
    setCityMetrics(prev => ({
      ...prev,
      [unit.city]: {
        plyEarned: (prev[unit.city]?.plyEarned || 0) + 10,
        crtEarned: (prev[unit.city]?.crtEarned || 0) + 1,
        forecast: prev[unit.city]?.forecast,
      }
    }));

    // Unlock a badge if applicable
    if (units + 1 >= 5 && !badges[1].unlocked) {
      setBadges(prev => prev.map(b => (b.id === "b2" ? { ...b, unlocked: true } : b)));
    }
  };

  const submitBatch = () => {
    setUnits(0);
  };

  const connectWallet = () => {
    setWalletConnected(true);
  };

  return (
    <RecyclingContext.Provider value={{ plyBalance, crtBalance, units, badges, cityMetrics, logRecycleUnit, submitBatch, connectWallet, walletConnected }}>
      {children}
    </RecyclingContext.Provider>
  );
}

export function useRecycling() {
  const context = useContext(RecyclingContext);
  if (!context) throw new Error("useRecycling must be used within RecyclingProvider");
  return context;
}

// --------------------- Scan Component ---------------------
export function RecycleScreen() {
  const { plyBalance, crtBalance, units, badges, cityMetrics, logRecycleUnit, walletConnected, connectWallet } = useRecycling();
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [cameraType, setCameraType] = useState<"camera" | "qr" | "nfc">("camera");
  const [showConfetti, setShowConfetti] = useState(false);
  const [play] = useSound(scanSuccessSound);

  const mockScan = async (type: "camera" | "qr" | "nfc") => {
    setIsScanning(true);
    setCameraType(type);
    setScanResult(null);
    await new Promise(r => setTimeout(r, 2000));
    const result = {
      plasticType: ["PET Bottle", "HDPE Container", "PP Cup"][Math.floor(Math.random() * 3)],
      confidence: 0.8 + Math.random() * 0.2,
      tokensEarned: Math.floor(10 + Math.random() * 20),
      verified: Math.random() > 0.1,
      location: ["San Francisco", "New York"][Math.floor(Math.random() * 2)]
    };
    setScanResult(result);
    setIsScanning(false);

    if (result.verified) {
      logRecycleUnit({ city: result.location, lat: 0, lng: 0 });
      play();
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted pb-24 relative">
      {showConfetti && <Confetti recycle={false} numberOfPieces={200} />}
      <MobileHeader title="Recycle Dashboard" />

      <main className="p-4 space-y-6">
        {/* Wallet Balances */}
        <EcoCard>
          <EcoCardHeader>
            <EcoCardTitle>Wallet Balances</EcoCardTitle>
          </EcoCardHeader>
          <EcoCardContent className="flex justify-around">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">PLY</p>
              <p className="font-bold text-eco-success">{plyBalance}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">CRT</p>
              <p className="font-bold text-eco-primary">{crtBalance}</p>
            </div>
            <div className="text-center">
              {!walletConnected ? (
                <EcoButton onClick={connectWallet} size="sm">Connect Wallet</EcoButton>
              ) : (
                <span className="text-sm text-eco-success">Wallet Connected</span>
              )}
            </div>
          </EcoCardContent>
        </EcoCard>

        {/* Scan Panel */}
        <EcoCard variant="elevated" padding="none">
          <div className="relative aspect-[4/3] bg-muted rounded-2xl flex items-center justify-center">
            {isScanning ? (
              <div className="text-center space-y-2">
                <Loader2 className="w-12 h-12 text-eco-primary animate-spin mx-auto" />
                <p className="text-sm text-muted-foreground">Processing {cameraType}</p>
                <Progress value={75} className="w-48 mx-auto" />
              </div>
            ) : (
              <div className="text-center">
                <Camera className="w-16 h-16 text-muted-foreground mx-auto mb-2" />
                <p className="font-semibold">Ready to Scan</p>
              </div>
            )}
          </div>

          <div className="p-4 grid grid-cols-2 gap-3">
            <EcoButton onClick={() => mockScan("camera")} disabled={isScanning} className="h-14">
              <Camera className="w-5 h-5" /> {isScanning && cameraType === "camera" ? "Scanning..." : "Camera"}
            </EcoButton>
            <EcoButton onClick={() => mockScan("qr")} disabled={isScanning} className="h-14">
              <QrCode className="w-5 h-5" /> {isScanning && cameraType === "qr" ? "Reading..." : "QR Code"}
            </EcoButton>
            <EcoButton onClick={() => mockScan("nfc")} disabled={isScanning} className="h-14">
              <Wifi className="w-5 h-5" /> {isScanning && cameraType === "nfc" ? "Processing..." : "NFC Scan"}
            </EcoButton>
            <EcoButton className="h-14">
              <Upload className="w-5 h-5" /> Upload
            </EcoButton>
          </div>
        </EcoCard>

        {/* Scan Result */}
        {scanResult && (
          <EcoCard>
            <EcoCardHeader>
              <EcoCardTitle className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-eco-success" />
                <span>Scan Result</span>
              </EcoCardTitle>
            </EcoCardHeader>
            <EcoCardContent className="space-y-2">
              <div className="flex justify-between items-center">
                <span>Plastic Type</span>
                <Badge variant="secondary">{scanResult.plasticType}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Confidence</span>
                <Progress value={scanResult.confidence * 100} className="w-32" />
              </div>
              <div className="flex justify-between items-center">
                <span>Tokens Earned</span>
                <span className="font-bold text-eco-success">+{scanResult.tokensEarned} PLY</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Status</span>
                <Badge variant={scanResult.verified ? "default" : "secondary"}>
                  {scanResult.verified ? "Verified" : "Pending"}
                </Badge>
              </div>
            </EcoCardContent>
          </EcoCard>
        )}

        {/* City Metrics */}
        <EcoCard>
          <EcoCardHeader>
            <EcoCardTitle>City Metrics & Projections</EcoCardTitle>
          </EcoCardHeader>
          <EcoCardContent className="space-y-4">
            {Object.entries(cityMetrics).map(([city, metric]) => (
              <div key={city} className="border-b border-muted py-2">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">{city}</span>
                  <span>PLY: {metric.forecast?.ply || 0}, CRT: {metric.forecast?.crt || 0}</span>
                </div>
                <Progress value={Math.min((metric.plyEarned / (metric.forecast?.ply || 1)) * 100, 100)} />
              </div>
            ))}
          </EcoCardContent>
        </EcoCard>

        {/* NFT Badges */}
        <EcoCard>
          <EcoCardHeader>
            <EcoCardTitle>NFT Badges</EcoCardTitle>
          </EcoCardHeader>
          <EcoCardContent className="flex flex-wrap gap-2">
            {badges.map(badge => (
              <Badge key={badge.id} variant={badge.unlocked ? "default" : "secondary"} title={badge.description}>
                {badge.name} ({badge.rarity})
              </Badge>
            ))}
          </EcoCardContent>
        </EcoCard>
      </main>
    </div>
  );
}
