"use client";

import React, { useEffect, useState, useRef } from "react";
import { View, Text, Dimensions, ScrollView } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { useRecycling } from "@/contexts/RecyclingContext";
import { ParticleEngine, ParticleTrigger } from "@/components/particles/ParticleEngine";

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
  const { cityMetrics } = useRecycling();
  const [historicalData, setHistoricalData] = useState<ChartDataPoint[]>([]);
  const prevDataRef = useRef<ChartDataPoint[]>([]);
  const chartWidth = Dimensions.get("window").width - 32;

  // Track particle triggers
  const [particleTriggers, setParticleTriggers] = useState<ParticleTrigger[]>([]);

  useEffect(() => {
    if (!cityMetrics) return;

    let metrics = city ? cityMetrics[city] : undefined;

    // Aggregate across cities if no specific city
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

    // Detect growth for particles
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

  const polyData = historicalData.map(d => d.poly);
  const crtData = historicalData.map(d => d.crt);
  const batchData = historicalData.map(d => d.batchCount);
  const labels = historicalData.map(d => d.date.slice(5)); // MM-DD

  return (
    <ScrollView horizontal style={{ marginVertical: 12 }}>
      <View style={{ position: "relative" }}>
        <Text style={{ fontWeight: "bold", fontSize: 16, marginBottom: 8 }}>
          {city ? `${city} Historical Trends` : "Global Historical Trends"}
        </Text>

        {/* Particle Engine */}
        <ParticleEngine triggers={particleTriggers} />

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
