import axios from 'axios';
import { API_BASE_URL } from '../constants';
import { Unit, Badge, CityMetrics, LeaderboardEntry } from '../types';
import { User } from '../types';

// === Submit a batch of recycled units to the backend ===
export const logRecycleBatch = async (user: User, batch: Unit[]) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/recycle/batch`, {
      userId: user.id,
      batch,
    });
    return response.data;
  } catch (error) {
    console.error('Error logging recycle batch:', error);
    throw error;
  }
};

// === Fetch global leaderboard entries ===
export const fetchLeaderboard = async (): Promise<LeaderboardEntry[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/leaderboard`);
    return response.data;
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return [];
  }
};

// === Fetch aggregated city metrics ===
export const fetchCityMetrics = async (): Promise<Record<string, CityMetrics>> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/metrics/cities`);
    // Expected format: { "New York": {...}, "San Francisco": {...} }
    return response.data;
  } catch (error) {
    console.error('Error fetching city metrics:', error);
    return {};
  }
};

// === Fetch badge stats, including NFT metadata and rarity ===
export const fetchBadgeStats = async (): Promise<Badge[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/badges`);
    return response.data;
  } catch (error) {
    console.error('Error fetching badge stats:', error);
    return [];
  }
};

// === Fetch historical trends per city for charts and analytics ===
export const fetchHistoricalTrends = async (cityId: string) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/metrics/history/${cityId}`);
    return response.data; // e.g., [{ date: '2025-08-01', poly: 120, crt: 60 }, ...]
  } catch (error) {
    console.error(`Error fetching historical trends for city ${cityId}:`, error);
    return [];
  }
};

// === Optional: fetch projected rewards and badge unlocks per city ===
export const fetchRewardProjections = async (cityId: string) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/projections/${cityId}`);
    return response.data; // e.g., { projectedPoly: 500, projectedCRT: 250, projectedBadges: [...] }
  } catch (error) {
    console.error(`Error fetching reward projections for city ${cityId}:`, error);
    return {};
  }
};
