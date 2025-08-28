import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface ScanResult {
  plasticType: string;
  confidence: number;
  tokensEarned: number;
  verified: boolean;
  location?: string;
  imageUrl?: string;
}

export function useCamera() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const { toast } = useToast();

  const capturePhoto = async (): Promise<ScanResult> => {
    setIsScanning(true);
    setScanResult(null);

    try {
      // Simulate camera capture and AI processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const mockResult: ScanResult = {
        plasticType: ['PET Bottle', 'HDPE Container', 'PP Cup', 'LDPE Bag'][Math.floor(Math.random() * 4)],
        confidence: 0.85 + Math.random() * 0.14,
        tokensEarned: Math.floor(15 + Math.random() * 25),
        verified: Math.random() > 0.2,
        location: 'San Francisco, CA',
        imageUrl: `https://images.unsplash.com/photo-${Date.now()}?w=400&h=300`
      };

      setScanResult(mockResult);
      
      toast({
        title: "Scan Successful! 📸",
        description: `+${mockResult.tokensEarned} PLY tokens earned`,
      });

      return mockResult;
    } catch (error) {
      toast({
        title: "Scan Failed",
        description: "Please try again",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsScanning(false);
    }
  };

  const uploadFromGallery = async () => {
    toast({
      title: "Gallery Upload",
      description: "Photo upload feature coming soon!",
    });
  };

  const clearResult = () => {
    setScanResult(null);
  };

  return {
    isScanning,
    scanResult,
    capturePhoto,
    uploadFromGallery,
    clearResult
  };
}