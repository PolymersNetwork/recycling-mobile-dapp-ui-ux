import { useState, useRef, useCallback } from 'react';

export interface CameraConstraints {
  width?: { ideal: number };
  height?: { ideal: number };
  facingMode?: 'user' | 'environment';
  aspectRatio?: number;
}

export interface CameraCapabilities {
  zoom?: boolean;
  torch?: boolean;
  focus?: boolean;
}

export function useCamera() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [capabilities, setCapabilities] = useState<CameraCapabilities>({});
  const videoRef = useRef<HTMLVideoElement>(null);

  const startCamera = useCallback(async (constraints: CameraConstraints = {}) => {
    try {
      setError(null);
      
      const defaultConstraints = {
        video: {
          facingMode: constraints.facingMode || 'environment',
          width: constraints.width || { ideal: 1280 },
          height: constraints.height || { ideal: 720 },
          aspectRatio: constraints.aspectRatio || 16/9
        },
        audio: false
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(defaultConstraints);
      setStream(mediaStream);
      setIsActive(true);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }

      // Get camera capabilities
      const videoTrack = mediaStream.getVideoTracks()[0];
      const trackCapabilities = videoTrack.getCapabilities() as any;
      
      setCapabilities({
        zoom: !!trackCapabilities.zoom,
        torch: !!trackCapabilities.torch,
        focus: !!trackCapabilities.focusMode
      });

      console.log('Camera started successfully');
      return mediaStream;
    } catch (err) {
      console.error('Error starting camera:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to access camera';
      setError(errorMessage);
      setIsActive(false);
      throw err;
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop();
      });
      setStream(null);
      setIsActive(false);
      
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      
      console.log('Camera stopped');
    }
  }, [stream]);

  const capturePhoto = useCallback((): string | null => {
    if (!videoRef.current || !isActive) {
      setError('Camera not active');
      return null;
    }

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const video = videoRef.current;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataURL = canvas.toDataURL('image/jpeg', 0.8);
        console.log('Photo captured successfully');
        return dataURL;
      }
      
      setError('Failed to capture photo');
      return null;
    } catch (err) {
      console.error('Error capturing photo:', err);
      setError('Failed to capture photo');
      return null;
    }
  }, [isActive]);

  const toggleTorch = useCallback(async (enabled: boolean) => {
    if (!stream || !capabilities.torch) {
      console.warn('Torch not supported on this device');
      return false;
    }

    try {
      const track = stream.getVideoTracks()[0];
      await track.applyConstraints({
        advanced: [{ torch: enabled } as any]
      });
      console.log(`Torch ${enabled ? 'enabled' : 'disabled'}`);
      return true;
    } catch (err) {
      console.error('Error toggling torch:', err);
      setError('Failed to toggle torch');
      return false;
    }
  }, [stream, capabilities.torch]);

  const setZoom = useCallback(async (zoomLevel: number) => {
    if (!stream || !capabilities.zoom) {
      console.warn('Zoom not supported on this device');
      return false;
    }

    try {
      const track = stream.getVideoTracks()[0];
      const trackCapabilities = track.getCapabilities() as any;
      
      const clampedZoom = Math.max(
        trackCapabilities.zoom?.min || 1,
        Math.min(trackCapabilities.zoom?.max || 1, zoomLevel)
      );

      await track.applyConstraints({
        advanced: [{ zoom: clampedZoom } as any]
      });
      
      console.log(`Zoom set to ${clampedZoom}`);
      return true;
    } catch (err) {
      console.error('Error setting zoom:', err);
      setError('Failed to set zoom');
      return false;
    }
  }, [stream, capabilities.zoom]);

  const switchCamera = useCallback(async () => {
    if (!stream) return false;

    try {
      const currentTrack = stream.getVideoTracks()[0];
      const currentFacingMode = currentTrack.getSettings().facingMode;
      const newFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';

      stopCamera();
      await startCamera({ facingMode: newFacingMode });
      
      console.log(`Switched to ${newFacingMode} camera`);
      return true;
    } catch (err) {
      console.error('Error switching camera:', err);
      setError('Failed to switch camera');
      return false;
    }
  }, [stream, stopCamera, startCamera]);

  const getDevices = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      return videoDevices;
    } catch (err) {
      console.error('Error getting devices:', err);
      return [];
    }
  }, []);

  return {
    stream,
    isActive,
    error,
    capabilities,
    videoRef,
    startCamera,
    stopCamera,
    capturePhoto,
    toggleTorch,
    setZoom,
    switchCamera,
    getDevices,
    clearError: () => setError(null)
  };
}