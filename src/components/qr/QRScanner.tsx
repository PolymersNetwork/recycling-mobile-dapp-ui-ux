import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Camera, 
  X, 
  Flashlight, 
  FlashlightOff, 
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Scan as ScanIcon
} from 'lucide-react';

interface QRScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
  isOpen: boolean;
  acceptedFormats?: string[];
}

export function QRScanner({ onScan, onClose, isOpen, acceptedFormats = ['QR'] }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [flashlight, setFlashlight] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastScan, setLastScan] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => stopCamera();
  }, [isOpen]);

  const startCamera = async () => {
    try {
      setError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }

      setScanning(true);
    } catch (err) {
      console.error('Camera access error:', err);
      setError('Unable to access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setScanning(false);
  };

  const toggleFlashlight = async () => {
    if (stream) {
      const track = stream.getVideoTracks()[0];
      const capabilities = track.getCapabilities();
      
      if (capabilities.torch) {
        try {
          await track.applyConstraints({
            advanced: [{ torch: !flashlight }]
          });
          setFlashlight(!flashlight);
        } catch (err) {
          console.error('Flashlight error:', err);
        }
      }
    }
  };

  const captureFrame = () => {
    if (!videoRef.current || !canvasRef.current) return null;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const video = videoRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    if (ctx) {
      ctx.drawImage(video, 0, 0);
      return canvas.toDataURL('image/jpeg', 0.8);
    }

    return null;
  };

  // Mock QR detection for demo purposes
  const mockQRDetection = () => {
    const mockResults = [
      'solana:7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgHkv?amount=25&memo=Recycling+Reward',
      'PLASTIC_ID:PET_001_20240115_BIN_A7',
      'DEPIN_NODE:NODE_123_SENSOR_VALIDATION_OK',
      'RECYCLING_CENTER:RC_001_LOCATION_VERIFIED'
    ];

    const randomResult = mockResults[Math.floor(Math.random() * mockResults.length)];
    return randomResult;
  };

  const handleManualScan = () => {
    const mockData = mockQRDetection();
    setLastScan(mockData);
    
    setTimeout(() => {
      onScan(mockData);
    }, 1000);
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
            />
            
            {/* Hidden canvas for frame capture */}
            <canvas ref={canvasRef} className="hidden" />

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
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleFlashlight}
                      className="text-white hover:bg-white/20"
                    >
                      {flashlight ? <FlashlightOff size={20} /> : <Flashlight size={20} />}
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
                    onClick={startCamera}
                    className="border-white/30 text-white hover:bg-white/20"
                  >
                    <RotateCcw size={16} className="mr-2" />
                    Restart
                  </Button>
                  
                  <Button
                    onClick={handleManualScan}
                    className="bg-eco-primary hover:bg-eco-primary/90 text-white px-8"
                  >
                    <ScanIcon size={20} className="mr-2" />
                    Capture
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