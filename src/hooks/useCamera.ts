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
  const [cameraType, setCameraType] = useState<'camera' | 'qr' | 'nfc'>('camera');
  const { toast } = useToast();

  const capturePhoto = async (): Promise<ScanResult> => {
    setIsScanning(true);
    setScanResult(null);
    setCameraType('camera');

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

  const scanQRCode = async (): Promise<ScanResult> => {
    setIsScanning(true);
    setScanResult(null);
    setCameraType('qr');

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockResult: ScanResult = {
        plasticType: 'Smart Bin QR',
        confidence: 0.95,
        tokensEarned: Math.floor(20 + Math.random() * 15),
        verified: true,
        location: 'Recycling Center',
        imageUrl: `https://images.unsplash.com/photo-${Date.now()}?w=400&h=300`
      };

      setScanResult(mockResult);
      
      toast({
        title: "QR Scan Successful! 📱",
        description: `+${mockResult.tokensEarned} PLY tokens earned`,
      });

      return mockResult;
    } catch (error) {
      toast({
        title: "QR Scan Failed",
        description: "Please try again",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsScanning(false);
    }
  };

  const scanNFC = async (): Promise<ScanResult> => {
    setIsScanning(true);
    setScanResult(null);
    setCameraType('nfc');

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockResult: ScanResult = {
        plasticType: 'NFC Smart Bin',
        confidence: 0.98,
        tokensEarned: Math.floor(25 + Math.random() * 20),
        verified: true,
        location: 'Smart Collection Point',
        imageUrl: `https://images.unsplash.com/photo-${Date.now()}?w=400&h=300`
      };

      setScanResult(mockResult);
      
      toast({
        title: "NFC Scan Successful! 📡",
        description: `+${mockResult.tokensEarned} PLY tokens earned`,
      });

      return mockResult;
    } catch (error) {
      toast({
        title: "NFC Scan Failed",
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
    cameraType,
    capturePhoto,
    scanQRCode,
    scanNFC,
    uploadFromGallery,
    clearResult
  };
}