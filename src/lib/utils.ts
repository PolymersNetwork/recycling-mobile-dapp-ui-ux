import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind CSS class names with clsx + twMerge
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Convert latitude/longitude to short geo-hash string
 * @param lat Latitude
 * @param lng Longitude
 */
export const generateGeoHash = (lat: number, lng: number): string => {
  return `${lat.toFixed(4)},${lng.toFixed(4)}`;
};

/**
 * Group an array of units by city
 * @param units Array of objects containing `city` property
 */
export const groupUnitsByCity = <T extends { city?: string }>(units: T[]): Record<string, T[]> => {
  return units.reduce((acc, unit) => {
    const city = unit.city ?? "Unknown";
    if (!acc[city]) acc[city] = [];
    acc[city].push(unit);
    return acc;
  }, {} as Record<string, T[]>);
};

/**
 * Format a number with commas for thousands
 * @param num Number to format
 */
export const formatNumber = (num: number): string => {
  return num.toLocaleString();
};

/**
 * Generate a UUID v4-like string for batches or NFTs
 */
export const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};
