import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCamera } from '@/hooks/use-camera';
import { SolanaQRGenerator } from '@/utils/qr-code';
import { 
  Camera, 
  X, 
  Flashlight, 
  FlashlightOff, 
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Scan as ScanIcon,
  SwitchCamera
} from 'lucide-react';

interface QRScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
  isOpen: boolean;
  acceptedFormats?: string[];
}

export function QRScanner({ onScan, onClose, isOpen, acceptedFormats = ['QR', 'Solana Pay'] }: QRScannerProps) {
  const { 
    videoRef, 
    isActive, 
    error, 
    capabilities, 
    startCamera, 
    stopCamera, 
    capturePhoto, 
    toggleTorch, 
    switchCamera,
    clearError 
  } = useCamera();
  
  const [flashlight, setFlashlight] = useState(false);
  const [lastScan, setLastScan] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    if (isOpen) {
      handleStartCamera();
    } else {
      stopCamera();
    }

    return () => stopCamera();
  }, [isOpen, startCamera, stopCamera]);

  const handleStartCamera = async () => {
    try {
      clearError();
      await startCamera({ facingMode: 'environment' });
      setScanning(true);
    } catch (err) {
      console.error('Camera access error:', err);
    }
  };

  const handleToggleFlashlight = async () => {
    if (capabilities.torch) {
      const success = await toggleTorch(!flashlight);
      if (success) {
        setFlashlight(!flashlight);
      }
    }
  };

  const handleSwitchCamera = async () => {
    await switchCamera();
  };

  const handleCapture = async () => {
    const photoData = capturePhoto();
    if (photoData) {
      // In a real app, this would analyze the QR code from the image
      const mockData = generateMockSolanaQR();
      setLastScan(mockData);
      
      setTimeout(() => {
        onScan(mockData);
      }, 1000);
    }
  };

  const generateMockSolanaQR = (): string => {
    const mockPayments = [
      'solana:7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgHkv?amount=25&memo=Recycling+Reward&label=PLY+Tokens',
      'solana:9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM?amount=50&spl-token=PLY123...&memo=Carbon+Credits',
      'solana:BWqcr7ESTtVoAaUFgYs2k9Q3KmgGtDjB1t6JqE3LqgxC?amount=15&memo=E-waste+Reward',
      'solana:APjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v?amount=10&spl-token=USDC&memo=Donation'
    ];

    return mockPayments[Math.floor(Math.random() * mockPayments.length)];
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 bg-black"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
            {/* Camera View */}
            <div className="relative w-full h-full">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                muted
                autoPlay
              />
              
              {/* Error Display */}
              {error && (
                <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                  <Card className="bg-red-500/20 border-red-500/50 max-w-sm mx-4">
                    <CardContent className="p-4 flex items-center space-x-3">
                      <AlertCircle className="text-red-400" size={24} />
                      <div>
                        <p className="text-white font-medium">Camera Error</p>
                        <p className="text-red-200 text-sm">{error}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

            {/* Scanning Overlay */}
            <div className="absolute inset-0">
              {/* Header */}
              <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={onClose}
                      className="text-white hover:bg-white/20"
                    >
                      <X size={24} />
                    </Button>
                    <div>
                      <h2 className="text-white text-lg font-semibold">QR Scanner</h2>
                      <p className="text-white/80 text-sm">Scan QR codes for rewards</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {capabilities.torch && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleToggleFlashlight}
                        className="text-white hover:bg-white/20"
                      >
                        {flashlight ? <FlashlightOff size={20} /> : <Flashlight size={20} />}
                      </Button>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleSwitchCamera}
                      className="text-white hover:bg-white/20"
                    >
                      <SwitchCamera size={20} />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Scanning Frame */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  className="relative w-64 h-64 border-2 border-white/50 rounded-2xl"
                  animate={{ scale: scanning ? [1, 1.05, 1] : 1 }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {/* Corner indicators */}
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-eco-success rounded-tl-lg" />
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-eco-success rounded-tr-lg" />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-eco-success rounded-bl-lg" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-eco-success rounded-br-lg" />
                  
                  {/* Scanning line */}
                  <motion.div
                    className="absolute left-0 right-0 h-1 bg-eco-success shadow-lg shadow-eco-success/50"
                    animate={{ y: [0, 250, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  />
                </motion.div>
              </div>

              {/* Footer */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                {error && (
                  <Card className="mb-4 bg-red-500/20 border-red-500/50">
                    <CardContent className="p-3 flex items-center space-x-2">
                      <AlertCircle size={20} className="text-red-400" />
                      <span className="text-white text-sm">{error}</span>
                    </CardContent>
                  </Card>
                )}

                {lastScan && (
                  <motion.div
                    className="mb-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card className="bg-eco-success/20 border-eco-success/50">
                      <CardContent className="p-3 flex items-center space-x-2">
                        <CheckCircle size={20} className="text-eco-success" />
                        <div className="flex-1">
                          <p className="text-white text-sm font-medium">QR Code Detected!</p>
                          <p className="text-white/80 text-xs truncate">{lastScan}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                <div className="flex items-center justify-center space-x-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleStartCamera}
                    className="border-white/30 text-white hover:bg-white/20"
                  >
                    <RotateCcw size={16} className="mr-2" />
                    Restart
                  </Button>
                  
                  <Button
                    onClick={handleCapture}
                    className="bg-primary hover:bg-primary/90 text-white px-8"
                    disabled={!isActive}
                  >
                    <ScanIcon size={20} className="mr-2" />
                    Scan QR
                  </Button>
                </div>

                <div className="flex items-center justify-center space-x-2 mt-4">
                  {acceptedFormats.map((format) => (
                    <Badge key={format} variant="secondary" className="bg-white/20 text-white">
                      {format}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}