import { useState } from "react";
import Confetti from "react-confetti";
import useSound from "use-sound";
import { MobileHeader } from "@/components/mobile/MobileHeader";
import { EcoButton } from "@/components/ui/eco-button";
import { EcoCard, EcoCardContent, EcoCardHeader, EcoCardTitle } from "@/components/ui/eco-card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Camera, Upload, Zap, CheckCircle, Loader2, QrCode, Wifi } from "lucide-react";
import { useCamera } from "@/hooks/useCamera";
import { useToast } from "@/hooks/use-toast";
import { useRecycling } from "@/contexts/RecyclingContext";
import { useProjects } from "@/hooks/useProjects";
import { useMarketplace } from "@/hooks/useMarketplace";
import scanSuccessSound from "@/assets/sounds/scan-success.mp3";

export function Scan() {
  const { isScanning, cameraType, capturePhoto, scanQRCode, scanNFC, uploadFromGallery, scanResult, clearResult } = useCamera();
  const { toast } = useToast();
  const { plyBalance, crtBalance, units, logRecycleUnit, badges, cityMetrics } = useRecycling();
  const { projects, contributeToProject } = useProjects();
  const { marketplaceItems } = useMarketplace();
  const [play] = useSound(scanSuccessSound);
  const [showConfetti, setShowConfetti] = useState(false);

  const handleScan = async (type: "camera" | "qr" | "nfc" = "camera") => {
    try {
      let result;
      switch (type) {
        case "camera":
          result = await capturePhoto();
          break;
        case "qr":
          result = await scanQRCode();
          break;
        case "nfc":
          result = await scanNFC();
          break;
      }

      if (result?.verified) {
        logRecycleUnit({ city: result.location || "Unknown", lat: 0, lng: 0 });
        play();
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }
    } catch (err) {
      toast({ title: "Scan failed", description: "Please try again", variant: "destructive" });
    }
  };

  const handleUpload = () => {
    uploadFromGallery();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted pb-24 relative">
      <MobileHeader title="Scan Plastic" />
      {showConfetti && <Confetti recycle={false} numberOfPieces={200} />}

      <main className="p-4 space-y-6">
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
            <EcoButton onClick={() => handleScan("camera")} disabled={isScanning} className="h-14">
              <Camera className="w-5 h-5" /> {isScanning && cameraType === "camera" ? "Scanning..." : "Camera"}
            </EcoButton>
            <EcoButton onClick={() => handleScan("qr")} disabled={isScanning} className="h-14">
              <QrCode className="w-5 h-5" /> {isScanning && cameraType === "qr" ? "Reading..." : "QR Code"}
            </EcoButton>
            <EcoButton onClick={() => handleScan("nfc")} disabled={isScanning} className="h-14">
              <Wifi className="w-5 h-5" /> {isScanning && cameraType === "nfc" ? "Processing..." : "NFC Scan"}
            </EcoButton>
            <EcoButton onClick={handleUpload} className="h-14">
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
                  <span>
                    PLY: {metric.forecast?.ply || 0}, CRT: {metric.forecast?.crt || 0}
                  </span>
                </div>
                <Progress value={Math.min((metric.polyEarned / (metric.forecast?.ply || 1)) * 100, 100)} />
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
            {badges.map((badge) => (
              <Badge key={badge.id} variant={badge.unlocked ? "default" : "secondary"}>
                {badge.name} ({badge.rarity})
              </Badge>
            ))}
          </EcoCardContent>
        </EcoCard>

        {/* Projects */}
        <EcoCard>
          <EcoCardHeader>
            <EcoCardTitle>Active Projects</EcoCardTitle>
          </EcoCardHeader>
          <EcoCardContent className="space-y-2">
            {projects.map((p) => (
              <div key={p.id} className="flex justify-between items-center">
                <span>{p.title}</span>
                <EcoButton size="sm" onClick={() => contributeToProject(p.id, 10, "PLY")}>
                  +10 PLY
                </EcoButton>
              </div>
            ))}
          </EcoCardContent>
        </EcoCard>

        {/* Marketplace */}
        <EcoCard>
          <EcoCardHeader>
            <EcoCardTitle>Marketplace Items</EcoCardTitle>
          </EcoCardHeader>
          <EcoCardContent className="space-y-2">
            {marketplaceItems.map((item) => (
              <div key={item.id} className="flex justify-between items-center">
                <span>{item.title}</span>
                <span className="font-semibold">
                  {item.price} {item.currency}
                </span>
              </div>
            ))}
          </EcoCardContent>
        </EcoCard>
      </main>
    </div>
  );
}
