import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Convert latitude/longitude to short geo-hash string
 */
export const generateGeoHash = (lat: number, lng: number) => {
  return `${lat.toFixed(4)},${lng.toFixed(4)}`;
};

/**
 * Group batch units by city
 */
export const groupUnitsByCity = (units: any[]) => {
  const grouped: Record<string, any[]> = {};
  units.forEach((unit) => {
    const city = unit.city || 'Unknown';
    if (!grouped[city]) grouped[city] = [];
    grouped[city].push(unit);
  });
  return grouped;
};

/**
 * Format number with commas
 */
export const formatNumber = (num: number) => {
  return num.toLocaleString();
};

/**
 * Generate unique ID for batch or NFT
 */
export const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0,
      v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};
