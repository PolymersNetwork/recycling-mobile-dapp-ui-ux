"use client";

import React, { useEffect, useState, useRef } from "react";
import { View, Text, Dimensions, ScrollView, LayoutRectangle, UIManager, findNodeHandle } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { useRecycling } from "@/contexts/RecyclingContext";
import { ParticleEngine, ParticleTrigger } from "@/components/particles/ParticleEngine";
import { AnimatedBadge } from "@/components/ui/AnimatedBadge";

interface ChartDataPoint {
  date: string;
  poly: number;
  crt: number;
  batchCount: number;
}

interface HistoricalChartsProps {
  city?: string;
}

export const HistoricalCharts: React.FC<HistoricalChartsProps> = ({ city }) => {
  const { cityMetrics, badges } = useRecycling();
  const [historicalData, setHistoricalData] = useState<ChartDataPoint[]>([]);
  const prevDataRef = useRef<ChartDataPoint[]>([]);
  const [particleTriggers, setParticleTriggers] = useState<ParticleTrigger[]>([]);
  const badgeRefs = useRef<Record<string, View | null>>({});
  const chartWidth = Dimensions.get("window").width - 32;

  // Helper to measure badge position on screen
  const measureBadge = async (id: string): Promise<{ x: number; y: number }> => {
    return new Promise((resolve) => {
      const badge = badgeRefs.current[id];
      if (!badge) return resolve({ x: 0, y: 0 });
      const handle = findNodeHandle(badge);
      if (!handle) return resolve({ x: 0, y: 0 });
      UIManager.measure(handle, (_, __, ___, width, height, pageX, pageY) => {
        resolve({ x: pageX + width / 2, y: pageY + height / 2 });
      });
    });
  };

  useEffect(() => {
    if (!cityMetrics) return;

    let metrics = city ? cityMetrics[city] : undefined;
    if (!metrics) {
      metrics = { polyEarned: 0, crtEarned: 0, batchCount: 0, leaderboard: [], historicalTrends: [] };
      Object.values(cityMetrics).forEach(c => {
        metrics!.polyEarned += c.polyEarned;
        metrics!.crtEarned += c.crtEarned;
        metrics!.batchCount += c.batchCount;
      });
    }

    // Generate simulated historical data
    const simulatedHistory: ChartDataPoint[] = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      simulatedHistory.push({
        date: date.toISOString().split("T")[0],
        poly: metrics!.polyEarned * Math.random(),
        crt: metrics!.crtEarned * Math.random(),
        batchCount: metrics!.batchCount * Math.random(),
      });
    }

    // Detect growth for chart particles
    const prevData = prevDataRef.current;
    const newTriggers: ParticleTrigger[] = [];
    simulatedHistory.forEach((point, idx) => {
      const prevPoint = prevData[idx];
      if (prevPoint) {
        if (point.poly > prevPoint.poly) {
          newTriggers.push({
            type: "coin",
            color: "green",
            amount: Math.ceil(point.poly - prevPoint.poly),
            x: (chartWidth / simulatedHistory.length) * idx + 16,
            y: 200 - (point.poly / (metrics!.polyEarned || 1)) * 180,
          });
        }
        if (point.crt > prevPoint.crt) {
          newTriggers.push({
            type: "sparkle",
            color: "blue",
            amount: Math.ceil(point.crt - prevPoint.crt),
            x: (chartWidth / simulatedHistory.length) * idx + 16,
            y: 200 - (point.crt / (metrics!.crtEarned || 1)) * 180,
          });
        }
      }
    });

    setParticleTriggers(newTriggers);
    prevDataRef.current = simulatedHistory;
    setHistoricalData(simulatedHistory);
  }, [city, cityMetrics]);

  // Trigger badge-based particle bursts
  const triggerBadgeParticles = async (badgeId: string, rarity: string) => {
    const pos = await measureBadge(badgeId);
    const colorMap: Record<string, string> = {
      legendary: "gold",
      epic: "blue",
      rare: "green",
      common: "gray",
    };
    const color = colorMap[rarity] || "white";
    setParticleTriggers((prev) => [
      ...prev,
      { type: "sparkle", color, amount: 15, x: pos.x, y: pos.y },
      { type: "coin", color, amount: 10, x: pos.x, y: pos.y },
    ]);
  };

  const polyData = historicalData.map(d => d.poly);
  const crtData = historicalData.map(d => d.crt);
  const batchData = historicalData.map(d => d.batchCount);
  const labels = historicalData.map(d => d.date.slice(5));

  return (
    <ScrollView horizontal style={{ marginVertical: 12 }}>
      <View style={{ position: "relative" }}>
        <Text style={{ fontWeight: "bold", fontSize: 16, marginBottom: 8 }}>
          {city ? `${city} Historical Trends` : "Global Historical Trends"}
        </Text>

        {/* Particle Engine */}
        <ParticleEngine triggers={particleTriggers} />

        {/* Animated Badges */}
        <View className="flex-row space-x-2 mt-2">
          {badges.map((badge) => (
            <AnimatedBadge
              key={badge.id}
              ref={(ref) => (badgeRefs.current[badge.id] = ref)}
              name={badge.name}
              rarity={badge.rarity}
              onMint={() => triggerBadgeParticles(badge.id, badge.rarity)}
            />
          ))}
        </View>

        {/* Line Chart */}
        <LineChart
          data={{
            labels,
            datasets: [
              { data: polyData, color: () => "rgba(0,128,0,0.7)", strokeWidth: 2, label: "PLY" },
              { data: crtData, color: () => "rgba(0,0,255,0.7)", strokeWidth: 2, label: "CRT" },
              { data: batchData, color: () => "rgba(255,165,0,0.7)", strokeWidth: 2, label: "Batches" },
            ],
            legend: ["PLY", "CRT", "Batches"],
          }}
          width={chartWidth}
          height={220}
          chartConfig={{
            backgroundGradientFrom: "#ffffff",
            backgroundGradientTo: "#f2f2f2",
            decimalPlaces: 2,
            color: (opacity = 1) => `rgba(34, 139, 34, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0,0,0,${opacity})`,
            style: { borderRadius: 16 },
            propsForDots: { r: "4", strokeWidth: "1", stroke: "#000" },
          }}
          bezier
          style={{ marginVertical: 8, borderRadius: 16 }}
        />
      </View>
    </ScrollView>
  );
};
