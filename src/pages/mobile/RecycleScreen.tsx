"use client";

import React, { useRef, useState, useEffect } from "react";
import Confetti from "react-confetti";
import { MobileHeader } from "@/components/mobile/MobileHeader";
import { EcoCard, EcoCardContent, EcoCardHeader, EcoCardTitle } from "@/components/ui/eco-card";
import { EcoButton } from "@/components/ui/eco-button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Camera, QrCode, Wifi, Upload, CheckCircle, Loader2, Zap } from "lucide-react";
import { useRecycling } from "@/contexts/RecyclingContext";
import { useProjects } from "@/hooks/useProjects";
import { ParticleEngine, ParticleRef } from "@/components/ui/ParticleEngine";
import useSound from "use-sound";
import scanSuccessSound from "@/assets/sounds/scan-success.mp3";
import { useToast } from "@/hooks/use-toast";

export function RecycleScreen() {
  const { plyBalance, crtBalance, units, logRecycleUnit, badges } = useRecycling();
  const { projects, contributeToProject } = useProjects();
  const particleRef = useRef<ParticleRef>(null);
  const { toast } = useToast();
  const [play] = useSound(scanSuccessSound);
  const [isScanning, setIsScanning] = useState(false);
  const [cameraType, setCameraType] = useState<"camera" | "qr" | "nfc">("camera");
  const [scanResult, setScanResult] = useState<any>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  /** Simulate scanning a unit */
  const handleScan = async (type: "camera" | "qr" | "nfc") => {
    setCameraType(type);
    setIsScanning(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate scan
      const result = {
        verified: true,
        tokensEarned: Math.floor(Math.random() * 50) + 10,
        plasticType: "PET",
        location: "Local City",
        confidence: Math.random()
      };
      setScanResult(result);

      if (result.verified) {
        logRecycleUnit({ city: result.location, lat: 0, lng: 0 });
        play();
        setShowConfetti(true);
        particleRef.current?.burstCoins({ count: 25, color: "#FFD700" }); // gold coins
        particleRef.current?.sparkleBadge({ count: 15, color: "#FFAA00" }); // badge sparkle
        setTimeout(() => setShowConfetti(false), 3000);
      }
    } catch (err) {
      toast({ title: "Scan failed", description: "Please try again", variant: "destructive" });
    } finally {
      setIsScanning(false);
    }
  };

  /** Upload from gallery (mock) */
  const handleUpload = () => {
    toast({ title: "Upload feature coming soon!" });
  };

  /** Contribute to a project */
  const handleContribute = async (projectId: string) => {
    try {
      await contributeToProject(projectId, 50, "PLY");
      particleRef.current?.burstCoins({ count: 20, color: "#00FFAA" });
      toast({ title: "Contribution Successful!" });
    } catch (err) {
      toast({ title: "Contribution Failed", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted pb-24 relative">
      <ParticleEngine ref={particleRef} />
      {showConfetti && <Confetti recycle={false} numberOfPieces={200} />}

      <MobileHeader title="Recycle & Earn" />

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
              <Camera className="w-5 h-5" /> Camera
            </EcoButton>
            <EcoButton onClick={() => handleScan("qr")} disabled={isScanning} className="h-14">
              <QrCode className="w-5 h-5" /> QR
            </EcoButton>
            <EcoButton onClick={() => handleScan("nfc")} disabled={isScanning} className="h-14">
              <Wifi className="w-5 h-5" /> NFC
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

        {/* Active Projects */}
        <EcoCard>
          <EcoCardHeader>
            <EcoCardTitle>Active Projects</EcoCardTitle>
          </EcoCardHeader>
          <EcoCardContent className="space-y-2">
            {projects.map(project => (
              <div key={project.id} className="flex justify-between items-center">
                <span>{project.title}</span>
                <EcoButton size="sm" onClick={() => handleContribute(project.id)}>
                  <Zap className="w-4 h-4" /> Contribute
                </EcoButton>
              </div>
            ))}
          </EcoCardContent>
        </EcoCard>

        {/* Badges */}
        <EcoCard>
          <EcoCardHeader>
            <EcoCardTitle>Earned Badges</EcoCardTitle>
          </EcoCardHeader>
          <EcoCardContent className="flex flex-wrap gap-2">
            {badges.map(b => (
              <Badge key={b.id} variant={b.unlocked ? "default" : "secondary"}>
                {b.name} ({b.rarity})
              </Badge>
            ))}
          </EcoCardContent>
        </EcoCard>
      </main>
    </div>
  );
}
