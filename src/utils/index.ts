export * from './operations';

// Utility functions for the app
export const formatPLY = (amount: number): string => {
  return `${amount.toLocaleString()} PLY`;
};

export const formatWeight = (weight: number): string => {
  return `${weight.toFixed(2)} kg`;
};

export const formatCarbonCredits = (credits: number): string => {
  return `${credits.toFixed(2)} CRT`;
};

export const calculateCarbonSaved = (weight: number): number => {
  // Approximate CO₂ saved per kg of plastic recycled
  return weight * 2.1;
};

export const formatCO2 = (co2: number): string => {
  return `${co2.toFixed(1)} kg CO₂`;
};

export const generateQRCodeData = (binId: string, location: { lat: number; lng: number }): string => {
  return JSON.stringify({
    type: 'recycle_bin',
    binId,
    location,
    weight: 0.5,
    timestamp: Date.now()
  });
};

export const isValidSolanaAddress = (address: string): boolean => {
  try {
    // Basic Solana address validation
    return address.length >= 32 && address.length <= 44;
  } catch {
    return false;
  }
};

export const shortenAddress = (address: string, chars = 4): string => {
  if (!address) return '';
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
};

export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const getRandomElement = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};