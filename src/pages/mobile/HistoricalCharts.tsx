import React, { useEffect, useState } from 'react';
import { View, Text, Dimensions, ScrollView } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useRecycling } from '../context/RecyclingContext';

interface ChartDataPoint {
  date: string; // e.g., "2025-08-27"
  poly: number;
  crt: number;
  batchCount: number;
}

interface HistoricalChartsProps {
  city?: string; // Optional: filter by city
}

export const HistoricalCharts: React.FC<HistoricalChartsProps> = ({ city }) => {
  const { cityMetrics } = useRecycling();
  const [historicalData, setHistoricalData] = useState<ChartDataPoint[]>([]);

  useEffect(() => {
    if (!cityMetrics) return;

    let metrics = city ? cityMetrics[city] : undefined;

    // If city is not provided, aggregate across all cities
    if (!metrics) {
      metrics = {
        polyEarned: 0,
        crtEarned: 0,
        batchCount: 0,
        leaderboard: [],
      };
      Object.values(cityMetrics).forEach(c => {
        metrics!.polyEarned += c.polyEarned;
        metrics!.crtEarned += c.crtEarned;
        metrics!.batchCount += c.batchCount;
      });
    }

    // Simulate fetching historical trends (replace with API call)
    const simulatedHistory: ChartDataPoint[] = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      simulatedHistory.push({
        date: date.toISOString().split('T')[0],
        poly: metrics!.polyEarned * Math.random(),
        crt: metrics!.crtEarned * Math.random(),
        batchCount: metrics!.batchCount * Math.random(),
      });
    }

    setHistoricalData(simulatedHistory);
  }, [city, cityMetrics]);

  const screenWidth = Dimensions.get('window').width - 32;

  const polyData = historicalData.map(d => d.poly);
  const crtData = historicalData.map(d => d.crt);
  const batchData = historicalData.map(d => d.batchCount);
  const labels = historicalData.map(d => d.date.slice(5)); // MM-DD

  return (
    <ScrollView horizontal style={{ marginVertical: 12 }}>
      <View>
        <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 8 }}>
          {city ? `${city} Historical Trends` : 'Global Historical Trends'}
        </Text>

        <LineChart
          data={{
            labels,
            datasets: [
              { data: plyData, color: () => 'rgba(0,128,0,0.7)', strokeWidth: 2, label: 'PLY' },
              { data: crtData, color: () => 'rgba(0,0,255,0.7)', strokeWidth: 2, label: 'CRT' },
              { data: batchData, color: () => 'rgba(255,165,0,0.7)', strokeWidth: 2, label: 'Batches' },
            ],
            legend: ['PLY', 'CRT', 'Batches'],
          }}
          width={screenWidth}
          height={220}
          chartConfig={{
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#f2f2f2',
            decimalPlaces: 2,
            color: (opacity = 1) => `rgba(34, 139, 34, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0,0,0,${opacity})`,
            style: { borderRadius: 16 },
            propsForDots: { r: '4', strokeWidth: '1', stroke: '#000' },
          }}
          bezier
          style={{ marginVertical: 8, borderRadius: 16 }}
        />
      </View>
    </ScrollView>
  );
};
