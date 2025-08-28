import { useState } from "react";
import { MobileHeader } from "@/components/mobile/MobileHeader";
import { EcoButton } from "@/components/ui/eco-button";
import { EcoCard, EcoCardContent, EcoCardHeader, EcoCardTitle } from "@/components/ui/eco-card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Camera, Upload, Zap, CheckCircle, AlertCircle, Loader2, MapPin, QrCode, Wifi } from "lucide-react";
import { useCamera } from "@/hooks/useCamera";
import { useToast } from "@/hooks/use-toast";
import { eventsService } from "@/services/events";

export function Scan() {
  const { isScanning, scanResult, cameraType, capturePhoto, scanQRCode, scanNFC, uploadFromGallery, clearResult } = useCamera();
  const { toast } = useToast();

  const handleScan = async (type: 'camera' | 'qr' | 'nfc' = 'camera') => {
    try {
      eventsService.trackRecycleStart(type);
      
      switch (type) {
        case 'camera':
          await capturePhoto();
          break;
        case 'qr':
          await scanQRCode();
          break;
        case 'nfc':
          await scanNFC();
          break;
      }
    } catch (error) {
      console.error('Scan failed:', error);
      eventsService.trackError('scan_failed', { type, error: error.message });
    }
  };

  const handleUpload = () => {
    uploadFromGallery();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted pb-20">
      <MobileHeader title="Scan Plastic" />
      
      <main className="p-4 space-y-6">
        {/* Camera View */}
        <EcoCard variant="elevated" padding="none">
          <div className="relative">
            <div className="aspect-[4/3] bg-gradient-to-br from-muted to-muted-foreground/20 rounded-t-2xl flex items-center justify-center">
              {isScanning ? (
                <div className="text-center space-y-4">
                  <Loader2 className="w-12 h-12 text-eco-primary animate-spin mx-auto" />
                  <div className="space-y-2">
                    <p className="text-lg font-semibold text-foreground">
                      {cameraType === 'camera' && 'Analyzing Photo...'}
                      {cameraType === 'qr' && 'Reading QR Code...'}
                      {cameraType === 'nfc' && 'Processing NFC...'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {cameraType === 'camera' && 'AI is detecting plastic type'}
                      {cameraType === 'qr' && 'Connecting to smart bin'}
                      {cameraType === 'nfc' && 'Verifying smart collection point'}
                    </p>
                    <Progress value={75} className="w-48 mx-auto" />
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <Camera className="w-16 h-16 text-muted-foreground mx-auto" />
                  <div>
                    <p className="text-lg font-semibold text-foreground">Ready to Scan</p>
                    <p className="text-sm text-muted-foreground">Point camera at plastic items</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Scan Overlay */}
            <div className="absolute inset-4 border-2 border-eco-primary/30 rounded-lg pointer-events-none">
              <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-eco-primary rounded-tl-lg"></div>
              <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-eco-primary rounded-tr-lg"></div>
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-eco-primary rounded-bl-lg"></div>
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-eco-primary rounded-br-lg"></div>
            </div>
          </div>
          
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-3 mb-4">
              <EcoButton 
                variant="eco" 
                onClick={() => handleScan('camera')}
                disabled={isScanning}
                className="h-14"
              >
                <Camera className="w-5 h-5" />
                {isScanning && cameraType === 'camera' ? "Scanning..." : "Camera"}
              </EcoButton>
              
              <EcoButton 
                variant="eco-outline" 
                onClick={() => handleScan('qr')}
                disabled={isScanning}
                className="h-14"
              >
                <QrCode className="w-5 h-5" />
                {isScanning && cameraType === 'qr' ? "Reading..." : "QR Code"}
              </EcoButton>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <EcoButton 
                variant="eco-outline" 
                onClick={() => handleScan('nfc')}
                disabled={isScanning}
                className="h-14"
              >
                <Wifi className="w-5 h-5" />
                {isScanning && cameraType === 'nfc' ? "Processing..." : "NFC Scan"}
              </EcoButton>
              
              <EcoButton 
                variant="eco-outline" 
                onClick={handleUpload}
                className="h-14"
              >
                <Upload className="w-5 h-5" />
                Upload Photo
              </EcoButton>
            </div>
          </div>
        </EcoCard>

        {/* Scan Result */}
        {scanResult && (
          <EcoCard variant="eco">
            <EcoCardHeader>
              <EcoCardTitle className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-eco-success" />
                <span>Scan Result</span>
              </EcoCardTitle>
            </EcoCardHeader>
            <EcoCardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Plastic Type</span>
                  <Badge variant="secondary">{scanResult.plasticType}</Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Confidence</span>
                  <div className="flex items-center space-x-2">
                    <Progress value={scanResult.confidence * 100} className="w-16 h-2" />
                    <span className="text-sm font-medium">{Math.round(scanResult.confidence * 100)}%</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Tokens Earned</span>
                  <div className="flex items-center space-x-1">
                    <Zap className="w-4 h-4 text-eco-success" />
                    <span className="font-bold text-eco-success">+{scanResult.tokensEarned} PLY</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge variant={scanResult.verified ? "default" : "secondary"}>
                    {scanResult.verified ? "Verified" : "Pending"}
                  </Badge>
                </div>
              </div>
            </EcoCardContent>
          </EcoCard>
        )}

        {/* Daily Progress */}
        <EcoCard>
          <EcoCardHeader>
            <EcoCardTitle>Today's Progress</EcoCardTitle>
          </EcoCardHeader>
          <EcoCardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Scans Completed</span>
                <span className="font-semibold">3/5</span>
              </div>
              <Progress value={60} className="h-2" />
              
              <div className="text-center">
                <p className="text-sm text-muted-foreground">2 more scans to complete daily challenge</p>
                <p className="text-xs text-eco-primary font-medium">+50 PLY bonus</p>
              </div>
            </div>
          </EcoCardContent>
        </EcoCard>

        {/* Tips */}
        <EcoCard>
          <EcoCardHeader>
            <EcoCardTitle className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-eco-warning" />
              <span>Scanning Tips</span>
            </EcoCardTitle>
          </EcoCardHeader>
          <EcoCardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Ensure good lighting for better detection</li>
              <li>• Center plastic item in frame</li>
              <li>• Clean items scan with higher confidence</li>
              <li>• Multiple angles increase accuracy</li>
            </ul>
          </EcoCardContent>
        </EcoCard>
      </main>
    </div>
  );
}