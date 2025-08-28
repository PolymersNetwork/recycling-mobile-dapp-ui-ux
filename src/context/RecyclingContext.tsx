import React, { createContext, useContext, useState, ReactNode } from 'react';

interface RecyclingContextProps {
  plyBalance: number;
  crtBalance: number;
  badges: any[];
  cityMetrics: any;
  logRecycle: (amount: number) => void;
  updateCityMetrics: (metrics: any) => void;
}

const RecyclingContext = createContext<RecyclingContextProps | undefined>(undefined);

export const RecyclingProvider = ({ children }: { children: ReactNode }) => {
  const [plyBalance, setPlyBalance] = useState(0);
  const [crtBalance, setCrtBalance] = useState(0);
  const [badges, setBadges] = useState<any[]>([]);
  const [cityMetrics, setCityMetrics] = useState<any>({});

  const logRecycle = (amount: number) => {
    setPlyBalance((prev) => prev + amount);
    setCrtBalance((prev) => prev + amount * 0.5);
  };

  const updateCityMetrics = (metrics: any) => {
    setCityMetrics(metrics);
  };

  return (
    <RecyclingContext.Provider
      value={{ plyBalance, crtBalance, badges, cityMetrics, logRecycle, updateCityMetrics }}
    >
      {children}
    </RecyclingContext.Provider>
  );
};

export const useRecycling = () => {
  const context = useContext(RecyclingContext);
  if (!context) throw new Error('useRecycling must be used within RecyclingProvider');
  return context;
};
