import axios from "axios";
import {
  User,
  BatchUnit,
  CityMetrics,
  LeaderboardEntry,
  BadgeStats,
  HistoricalTrend,
} from "../types";
import { API_BASE_URL } from "../constants";

/**
 * Submit a batch of recycled units for a given user
 */
export const logRecycleBatch = async (user: User, batch: BatchUnit[]) => {
  const response = await axios.post(`${API_BASE_URL}/recycle/batch`, {
    userId: user.id,
    batch,
  });
  return response.data;
};

/**
 * Fetch the real-time leaderboard
 */
export const fetchLeaderboard = async (): Promise<LeaderboardEntry[]> => {
  const response = await axios.get(`${API_BASE_URL}/leaderboard`);
  return response.data;
};

/**
 * Fetch aggregated metrics per city
 */
export const fetchCityMetrics = async (): Promise<CityMetrics[]> => {
  const response = await axios.get(`${API_BASE_URL}/metrics/cities`);
  return response.data;
};

/**
 * Fetch badge stats, including dynamic NFT rarity
 */
export const fetchBadgeStats = async (): Promise<BadgeStats[]> => {
  const response = await axios.get(`${API_BASE_URL}/badges`);
  return response.data;
};

/**
 * Fetch historical trends for a given city (e.g., POLY/CRT earned over time)
 */
export const fetchHistoricalTrends = async (cityId: string): Promise<HistoricalTrend[]> => {
  const response = await axios.get(`${API_BASE_URL}/metrics/history/${cityId}`);
  return response.data;
};
