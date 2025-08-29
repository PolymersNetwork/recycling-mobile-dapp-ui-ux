import { useState } from 'react';
import { toast } from 'sonner';
import { useRecycling } from '../contexts/RecyclingContext';

export interface ScanResult {
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
  const { submitRecycling } = useRecycling();

  const processScan = async (type: 'camera' | 'qr' | 'nfc') => {
    setIsScanning(true);
    setScanResult(null);
    setCameraType(type);

    try {
      // Simulate camera/NFC/QR capture + AI verification
      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1000));

      const mockResult: ScanResult = {
        plasticType: type === 'camera'
          ? ['PET Bottle', 'HDPE Container', 'PP Cup', 'LDPE Bag'][Math.floor(Math.random() * 4)]
          : type === 'qr' ? 'Smart Bin QR' : 'NFC Smart Bin',
        confidence: 0.8 + Math.random() * 0.18,
        tokensEarned: Math.floor(15 + Math.random() * 30),
        verified: Math.random() > 0.1,
        location: 'San Francisco, CA',
        imageUrl: `https://images.unsplash.com/photo-${Date.now()}?w=400&h=300`
      };

      setScanResult(mockResult);

      // Log to recycling context if verified
      if (mockResult.verified) {
        await submitRecycling({
          userId: '1',
          type: 'plastic',
          weight: 1,
          location: mockResult.location || 'Unknown',
          imageUrl: mockResult.imageUrl || '',
          verified: true,
          tokensEarned: mockResult.tokensEarned,
        });
      }

      toast(`${type.toUpperCase()} Scan Successful! +${mockResult.tokensEarned} POLY tokens earned`);
      return mockResult;
    } catch (error) {
      toast(`${type.toUpperCase()} Scan Failed - Please try again`);
      throw error;
    } finally {
      setIsScanning(false);
    }
  };

  const capturePhoto = () => processScan('camera');
  const scanQRCode = () => processScan('qr');
  const scanNFC = () => processScan('nfc');

  const uploadFromGallery = async () => {
    toast('Gallery Upload - Photo upload feature coming soon!');
  };

  const clearResult = () => setScanResult(null);

  return {
    isScanning,
    scanResult,
    cameraType,
    capturePhoto,
    scanQRCode,
    scanNFC,
    uploadFromGallery,
    clearResult,
  };
}