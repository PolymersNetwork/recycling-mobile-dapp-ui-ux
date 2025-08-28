export const calculateRewardForecast = (cityMetrics: any) => {
  const forecasts: Record<string, { poly: number; crt: number }> = {};
  Object.entries(cityMetrics).forEach(([city, metrics]: any) => {
    // Simple linear projection based on past week
    const poly = metrics.polyEarned * 1.2; // +20% forecast
    const crt = metrics.crtEarned * 1.2;
    forecasts[city] = { poly, crt };
  });
  return forecasts;
};

export const calculateBadgeRarity = (badge: any) => {
  // Rarity inversely proportional to number of unlocked users
  const totalUsers = badge.totalUsers || 1000;
  const unlockedUsers = badge.unlockedUsers || 10;
  return Math.max(1, Math.min(100, (1 - unlockedUsers / totalUsers) * 100));
};
