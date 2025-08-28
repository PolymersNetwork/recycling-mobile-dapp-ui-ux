import axios from 'axios';
import { User, BatchUnit, CityMetrics, LeaderboardEntry, BadgeStats } from '../types';
import { API_BASE_URL } from '../constants';

// Submit batch to backend
export const logRecycleBatch = async (
  user: User,
  batch: BatchUnit[]
) => {
  const response = await axios.post(`${API_BASE_URL}/recycle/batch`, {
    userId: user.id,
    batch,
  });
  return response.data;
};

// Fetch real-time leaderboard
export const fetchLeaderboard = async (): Promise<LeaderboardEntry[]> => {
  const response = await axios.get(`${API_BASE_URL}/leaderboard`);
  return response.data;
};

// Fetch aggregated metrics per city
export const fetchCityMetrics = async (): Promise<CityMetrics[]> => {
  const response = await axios.get(`${API_BASE_URL}/metrics/cities`);
  return response.data;
};

// Fetch badge stats and NFT rarity
export const fetchBadgeStats = async (): Promise<BadgeStats[]> => {
  const response = await axios.get(`${API_BASE_URL}/badges`);
  return response.data;
};

// Fetch historical trends per city
export const fetchHistoricalTrends = async (cityId: string) => {
  const response = await axios.get(`${API_BASE_URL}/metrics/history/${cityId}`);
  return response.data;
};
