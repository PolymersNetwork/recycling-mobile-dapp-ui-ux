// Utility functions for the Polymers platform

export const formatCurrency = (amount: number, currency: string = 'POLY') => {
  return `${amount.toLocaleString()} ${currency}`;
};

export const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString();
};

export const formatPercentage = (value: number) => {
  return `${(value * 100).toFixed(1)}%`;
};

export const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};

export const delay = (ms: number) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const formatPLY = (amount: number): string => {
  return `${amount.toLocaleString()} PLY`;
};

export const formatWeight = (weight: number): string => {
  return `${weight.toFixed(2)} kg`;
};

export const calculateCarbonSaved = (weight: number): number => {
  return weight * 2.1;
};

export const formatCO2 = (co2: number): string => {
  return `${co2.toFixed(1)} kg CO₂`;
};