import { useState, useRef, useEffect } from "react";
import { MobileHeader } from "@/components/mobile/MobileHeader";
import { EcoButton } from "@/components/ui/eco-button";
import { EcoCard, EcoCardContent, EcoCardHeader, EcoCardTitle } from "@/components/ui/eco-card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { QRScanner } from "@/components/qr/QRScanner";
import { useCamera } from "@/hooks/use-camera";
import { Camera, Upload, Zap, CheckCircle, AlertCircle, Loader2, RotateCcw, Flashlight, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function Scan() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const { toast } = useToast();
  
  const {
    videoRef,
    isActive,
    capabilities,
    startCamera,
    stopCamera,
    capturePhoto,
    toggleTorch,
    switchCamera,
    error: cameraError
  } = useCamera();

  const handleStartCamera = async () => {
    setShowCamera(true);
    try {
      await startCamera({
        facingMode: 'environment',
        width: { ideal: 1920 },
        height: { ideal: 1080 }
      });
    } catch (error) {
      console.error('Failed to start camera:', error);
      toast({
        title: "Camera Error",
        description: "Failed to access camera. Please check permissions.",
        variant: "destructive"
      });
      setShowCamera(false);
    }
  };

  const handleStopCamera = () => {
    stopCamera();
    setShowCamera(false);
    setCapturedImage(null);
  };

  const handleCapture = async () => {
    try {
      const photoDataUrl = await capturePhoto();
      setCapturedImage(photoDataUrl);
      setIsScanning(true);
      
      // Simulate AI analysis
      setTimeout(() => {
        const mockResult = {
          plasticType: 'PET Bottle',
          confidence: 0.94,
          tokensEarned: 25,
          verified: true,
          location: 'GPS Verified',
          timestamp: new Date().toISOString()
        };
        setScanResult(mockResult);
        setIsScanning(false);
        handleStopCamera();
        
        toast({
          title: "Scan Successful!",
          description: `+${mockResult.tokensEarned} PLY tokens earned`,
        });
      }, 3000);
    } catch (error) {
      console.error('Failed to capture photo:', error);
      toast({
        title: "Capture Failed",
        description: "Failed to capture photo. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const imageUrl = e.target?.result as string;
          setCapturedImage(imageUrl);
          setIsScanning(true);
          
          setTimeout(() => {
            const mockResult = {
              plasticType: 'PET Bottle',
              confidence: 0.89,
              tokensEarned: 20,
              verified: false,
              location: 'Manual Upload'
            };
            setScanResult(mockResult);
            setIsScanning(false);
            
            toast({
              title: "Analysis Complete!",
              description: `+${mockResult.tokensEarned} PLY tokens earned`,
            });
          }, 2000);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  useEffect(() => {
    return () => {
      if (isActive) {
        stopCamera();
      }
    };
  }, [isActive, stopCamera]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-dark via-brand-primary to-brand-dark pb-20">
      <MobileHeader title="AI Plastic Scanner" />
      
      {/* Camera Modal */}
      {showCamera && (
        <div className="fixed inset-0 z-50 bg-black">
          <div className="relative h-full">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            
            {/* Camera Overlay */}
            <div className="absolute inset-0 flex flex-col">
              {/* Top Controls */}
              <div className="flex justify-between items-center p-4 bg-gradient-to-b from-black/50 to-transparent">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleStopCamera}
                  className="text-white hover:bg-white/20"
                >
                  <X className="w-6 h-6" />
                </Button>
                <h2 className="text-white font-semibold">Scan Plastic</h2>
                <div className="flex space-x-2">
                  {capabilities.torch && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleTorch(true)}
                      className="text-white hover:bg-white/20"
                    >
                      <Flashlight className="w-5 h-5" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={switchCamera}
                    className="text-white hover:bg-white/20"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </Button>
                </div>
              </div>
              
              {/* Center Frame */}
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="relative w-64 h-64 border-4 border-brand-accent rounded-3xl">
                  <div className="absolute -top-2 -left-2 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-2xl"></div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-2xl"></div>
                  <div className="absolute -bottom-2 -left-2 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-2xl"></div>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-2xl"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-white text-sm font-medium bg-black/50 px-3 py-1 rounded-full">
                      Center plastic item
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Bottom Controls */}
              <div className="p-8 bg-gradient-to-t from-black/70 to-transparent">
                <div className="flex justify-center">
                  <Button
                    size="lg"
                    onClick={handleCapture}
                    disabled={isScanning}
                    className="w-20 h-20 rounded-full bg-white hover:bg-white/90 text-brand-primary"
                  >
                    {isScanning ? (
                      <Loader2 className="w-8 h-8 animate-spin" />
                    ) : (
                      <Camera className="w-8 h-8" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <main className="p-4 space-y-6">
        {/* Camera View */}
        <EcoCard className="bg-gradient-to-br from-brand-dark/80 to-brand-primary/20 border-brand-primary/30" padding="none">
          <div className="relative">
            <div className="aspect-[4/3] bg-gradient-to-br from-brand-primary/20 to-brand-dark/40 rounded-t-2xl flex items-center justify-center overflow-hidden">
              {capturedImage ? (
                <img 
                  src={capturedImage} 
                  alt="Captured"
                  className="w-full h-full object-cover"
                />
              ) : isScanning ? (
                <div className="text-center space-y-4 p-6">
                  <Loader2 className="w-16 h-16 text-brand-accent animate-spin mx-auto" />
                  <div className="space-y-2">
                    <p className="text-xl font-bold text-white">Analyzing...</p>
                    <p className="text-sm text-brand-primary-light">AI is detecting plastic type</p>
                    <Progress value={75} className="w-48 mx-auto h-2 bg-brand-dark/50" />
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-4 p-6">
                  <div className="w-20 h-20 rounded-full bg-brand-primary/30 flex items-center justify-center mx-auto">
                    <Camera className="w-10 h-10 text-brand-accent" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-white">Ready to Scan</p>
                    <p className="text-sm text-brand-primary-light">Use camera or upload photo</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Scan Overlay */}
            {!capturedImage && !isScanning && (
              <div className="absolute inset-6 border-2 border-brand-accent/50 rounded-2xl pointer-events-none">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-brand-accent rounded-tl-xl"></div>
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-brand-accent rounded-tr-xl"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-brand-accent rounded-bl-xl"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-brand-accent rounded-br-xl"></div>
              </div>
            )}
          </div>
          
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Button 
                variant="brand"
                onClick={handleStartCamera}
                disabled={isScanning}
                className="h-16 flex-col space-y-2"
              >
                <Camera className="w-6 h-6" />
                <span className="text-sm font-semibold">Camera Scan</span>
              </Button>
              
              <Button 
                variant="brand-outline"
                onClick={handleUpload}
                disabled={isScanning}
                className="h-16 flex-col space-y-2"
              >
                <Upload className="w-6 h-6" />
                <span className="text-sm font-semibold">Upload Photo</span>
              </Button>
            </div>
          </div>
        </EcoCard>

        {/* Scan Result */}
        {scanResult && (
          <EcoCard className="bg-gradient-to-br from-brand-success/20 to-brand-accent/10 border-brand-success/30">
            <EcoCardHeader>
              <EcoCardTitle className="flex items-center space-x-2 text-white">
                <CheckCircle className="w-6 h-6 text-brand-success" />
                <span>Scan Result</span>
              </EcoCardTitle>
            </EcoCardHeader>
            <EcoCardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-brand-primary-light">Plastic Type</span>
                  <Badge className="bg-brand-accent text-brand-dark font-bold">{scanResult.plasticType}</Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-brand-primary-light">Confidence</span>
                  <div className="flex items-center space-x-3">
                    <Progress 
                      value={scanResult.confidence * 100} 
                      className="w-20 h-2 bg-brand-dark/30" 
                    />
                    <span className="text-sm font-bold text-white">{Math.round(scanResult.confidence * 100)}%</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-brand-primary-light">Tokens Earned</span>
                  <div className="flex items-center space-x-2">
                    <Zap className="w-5 h-5 text-brand-accent" />
                    <span className="font-bold text-brand-accent text-lg">+{scanResult.tokensEarned} PLY</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-brand-primary-light">Status</span>
                  <Badge 
                    className={scanResult.verified 
                      ? "bg-brand-success text-white" 
                      : "bg-brand-warning text-brand-dark"
                    }
                  >
                    {scanResult.verified ? "Verified" : "Pending"}
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-brand-primary-light">Location</span>
                  <span className="text-sm font-medium text-white">{scanResult.location}</span>
                </div>
              </div>
            </EcoCardContent>
          </EcoCard>
        )}

        {/* Daily Progress */}
        <EcoCard className="bg-gradient-to-br from-brand-dark/80 to-brand-primary/20 border-brand-primary/30">
          <EcoCardHeader>
            <EcoCardTitle className="text-white flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-brand-accent" />
              <span>Today's Progress</span>
            </EcoCardTitle>
          </EcoCardHeader>
          <EcoCardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-brand-primary-light">Scans Completed</span>
                <span className="font-bold text-white text-lg">3/5</span>
              </div>
              <Progress value={60} className="h-3 bg-brand-dark/50" />
              
              <div className="text-center p-4 bg-gradient-to-r from-brand-accent/10 to-brand-success/10 rounded-xl">
                <p className="text-sm font-medium text-white">2 more scans to complete daily challenge</p>
                <p className="text-sm text-brand-accent font-bold">+50 PLY bonus</p>
              </div>
            </div>
          </EcoCardContent>
        </EcoCard>

        {/* Tips */}
        <EcoCard className="bg-gradient-to-br from-brand-dark/80 to-brand-primary/20 border-brand-primary/30">
          <EcoCardHeader>
            <EcoCardTitle className="flex items-center space-x-2 text-white">
              <AlertCircle className="w-5 h-5 text-brand-warning" />
              <span>Scanning Tips</span>
            </EcoCardTitle>
          </EcoCardHeader>
          <EcoCardContent>
            <div className="grid grid-cols-1 gap-3">
              {[
                "Ensure good lighting for better detection",
                "Center plastic item in camera frame",
                "Clean items scan with higher confidence", 
                "Multiple angles increase accuracy"
              ].map((tip, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gradient-to-r from-brand-primary/10 to-transparent rounded-lg">
                  <div className="w-2 h-2 bg-brand-accent rounded-full flex-shrink-0"></div>
                  <span className="text-sm font-medium text-brand-primary-light">{tip}</span>
                </div>
              ))}
            </div>
          </EcoCardContent>
        </EcoCard>
      </main>
    </div>
  );
}