import { useState, useEffect, useContext } from "react";
import { RecyclingContext } from "@/contexts/RecyclingContext";
import { MobileHeader } from "@/components/mobile/MobileHeader";
import { EcoCard, EcoCardHeader, EcoCardTitle, EcoCardContent } from "@/components/ui/eco-card";
import { EcoButton } from "@/components/ui/eco-button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Camera, QrCode, Wifi, Upload, Zap, Star } from "lucide-react";
import Confetti from "react-confetti";
import useSound from "use-sound";
import scanSuccessSound from "@/assets/sounds/scan-success.mp3";
import contributeSound from "@/assets/sounds/contribute-success.mp3";
import { useWindowSize } from "react-use";

export function RecycleScreen() {
  const { width, height } = useWindowSize();
  const { 
    wallet, balances, scanResult, isScanning, cameraType, capturePhoto, scanQRCode, scanNFC, clearResult,
    badges, projects, marketplace, contributeToProject
  } = useContext(RecyclingContext);

  const [showConfetti, setShowConfetti] = useState(false);
  const [playScanSound] = useSound(scanSuccessSound);
  const [playContributeSound] = useSound(contributeSound);

  const handleScan = async (type: "camera" | "qr" | "nfc") => {
    try {
      let result;
      if (type === "camera") result = await capturePhoto();
      if (type === "qr") result = await scanQRCode();
      if (type === "nfc") result = await scanNFC();

      if (result) {
        setShowConfetti(true);
        playScanSound();
        setTimeout(() => setShowConfetti(false), 4000);
      }
    } catch (err) {
      console.error("Scan failed", err);
    }
  };

  const handleContribute = async (projectId: string, amount: number, currency: "PLY" | "USDC" | "SOL") => {
    try {
      await contributeToProject(projectId, amount, currency);
      playContributeSound();
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    } catch (err) {
      console.error("Contribution failed", err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted pb-20">
      {showConfetti && <Confetti width={width} height={height} />}
      <MobileHeader title="Recycle Dashboard" showNotifications showSettings notificationCount={wallet?.balances.length || 0} />

      <main className="p-4 space-y-6">
        {/* Wallet Balances */}
        <EcoCard>
          <EcoCardHeader>
            <EcoCardTitle>Wallet Balances</EcoCardTitle>
          </EcoCardHeader>
          <EcoCardContent className="space-y-2">
            {balances.map(balance => (
              <div key={balance.symbol} className="flex justify-between items-center">
                <span>{balance.symbol}</span>
                <span className="font-semibold">{balance.amount.toFixed(2)} ({balance.usdValue.toFixed(2)} USD)</span>
              </div>
            ))}
          </EcoCardContent>
        </EcoCard>

        {/* Scan Buttons */}
        <EcoCard>
          <EcoCardHeader>
            <EcoCardTitle>Scan Plastic</EcoCardTitle>
          </EcoCardHeader>
          <EcoCardContent className="grid grid-cols-2 gap-3">
            <EcoButton onClick={() => handleScan("camera")} disabled={isScanning}><Camera className="w-5 h-5 mr-2" />Camera</EcoButton>
            <EcoButton onClick={() => handleScan("qr")} disabled={isScanning}><QrCode className="w-5 h-5 mr-2" />QR</EcoButton>
            <EcoButton onClick={() => handleScan("nfc")} disabled={isScanning}><Wifi className="w-5 h-5 mr-2" />NFC</EcoButton>
            <EcoButton onClick={() => console.log("Upload")}><Upload className="w-5 h-5 mr-2" />Upload</EcoButton>
          </EcoCardContent>
        </EcoCard>

        {/* Scan Result */}
        {scanResult && (
          <EcoCard>
            <EcoCardHeader>
              <EcoCardTitle>Last Scan</EcoCardTitle>
            </EcoCardHeader>
            <EcoCardContent className="space-y-2">
              <div className="flex justify-between">
                <span>Plastic Type:</span> <Badge variant="secondary">{scanResult.plasticType}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Confidence:</span>
                <Progress value={scanResult.confidence * 100} className="w-32 h-2" />
                <span>{(scanResult.confidence * 100).toFixed(0)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Tokens Earned:</span> <span className="font-bold text-eco-success">+{scanResult.tokensEarned} PLY</span>
              </div>
            </EcoCardContent>
          </EcoCard>
        )}

        {/* Badges */}
        <EcoCard>
          <EcoCardHeader>
            <EcoCardTitle>Achievements</EcoCardTitle>
          </EcoCardHeader>
          <EcoCardContent className="flex flex-wrap gap-2">
            {badges.map(badge => (
              <Badge key={badge.id} variant="default" className={`bg-opacity-20 ${badge.rarity}`}>
                <Star className="w-4 h-4 mr-1 inline-block" />
                {badge.name}
              </Badge>
            ))}
          </EcoCardContent>
        </EcoCard>

        {/* Projects */}
        <EcoCard>
          <EcoCardHeader>
            <EcoCardTitle>Projects</EcoCardTitle>
          </EcoCardHeader>
          <EcoCardContent className="space-y-2">
            {projects.map(project => (
              <EcoCard key={project.id} className="p-2">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">{project.title}</span>
                  <span>{project.currentAmount}/{project.targetAmount} PLY</span>
                </div>
                <Progress value={(project.currentAmount / project.targetAmount) * 100} className="h-2 mt-1" />
                <EcoButton onClick={() => handleContribute(project.id, 50, "PLY")} className="mt-2 h-10 w-full">Contribute 50 PLY</EcoButton>
              </EcoCard>
            ))}
          </EcoCardContent>
        </EcoCard>

        {/* Marketplace */}
        <EcoCard>
          <EcoCardHeader>
            <EcoCardTitle>Marketplace</EcoCardTitle>
          </EcoCardHeader>
          <EcoCardContent className="space-y-2">
            {marketplace.map(item => (
              <EcoCard key={item.id} className="p-2 flex justify-between items-center">
                <span>{item.title}</span>
                <EcoButton onClick={() => console.log("Purchase", item.id)} size="sm">Buy {item.price} {item.currency}</EcoButton>
              </EcoCard>
            ))}
          </EcoCardContent>
        </EcoCard>
      </main>
    </div>
  );
}
