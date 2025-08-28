import React from "react";
import { View, Text } from "react-native";
import { VictoryChart, VictoryBar, VictoryAxis, VictoryTheme, VictoryLabel } from "victory-native";

type CityMetric = {
  city: string;
  ply: number;
  crt: number;
};

interface ChartProps {
  data: CityMetric[];
  width?: number;
  height?: number;
}

export const ChartContainer: React.FC<ChartProps> = ({ data, width = 350, height = 200 }) => {
  // Map data for Victory
  const plyData = data.map((d) => ({ x: d.city, y: d.ply }));
  const crtData = data.map((d) => ({ x: d.city, y: d.crt }));

  return (
    <View className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
      <Text className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
        City Metrics
      </Text>
      <VictoryChart
        theme={VictoryTheme.material}
        domainPadding={{ x: 40, y: 10 }}
        width={width}
        height={height}
      >
        <VictoryAxis
          style={{
            axis: { stroke: "#ccc" },
            tickLabels: { fill: "#374151", fontSize: 12 },
          }}
        />
        <VictoryAxis
          dependentAxis
          style={{
            axis: { stroke: "#ccc" },
            tickLabels: { fill: "#374151", fontSize: 12 },
          }}
        />
        <VictoryBar
          data={plyData}
          x="x"
          y="y"
          barWidth={20}
          style={{
            data: { fill: "#10b981" }, // PLY color
          }}
          labels={({ datum }) => datum.y}
          labelComponent={<VictoryLabel dy={-10} />}
        />
        <VictoryBar
          data={crtData}
          x="x"
          y="y"
          barWidth={20}
          style={{
            data: { fill: "#fbbf24" }, // CRT color
          }}
          labels={({ datum }) => datum.y}
          labelComponent={<VictoryLabel dy={-10} />}
        />
      </VictoryChart>
    </View>
  );
};
