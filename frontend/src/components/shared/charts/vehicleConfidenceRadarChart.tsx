// components/charts/VehicleConfidenceRadarChart.tsx
"use client";

import React, { useMemo } from "react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export interface Event {
  id: number;
  vehicleType: string;
  confidenceScore: number;
  // add other fields as needed
}

export interface VehicleConfidenceRadarChartProps {
  data: Event[];
}

const VehicleConfidenceRadarChart: React.FC<VehicleConfidenceRadarChartProps> = ({ data }) => {
  // Compute average confidence score per vehicle type.
  const radarData = useMemo(() => {
    const sums: Record<string, { total: number; count: number }> = {};
    data.forEach((event) => {
      if (!sums[event.vehicleType]) {
        sums[event.vehicleType] = { total: 0, count: 0 };
      }
      sums[event.vehicleType].total += event.confidenceScore;
      sums[event.vehicleType].count += 1;
    });
    return Object.keys(sums).map((type) => ({
      vehicleType: type,
      avgConfidence: sums[type].total / sums[type].count,
    }));
  }, [data]);

  return (
    <div className="bg-white shadow rounded-lg p-4">
      <h3 className="text-lg font-medium mb-4">
        Average Confidence Score by Vehicle Type
      </h3>
      <div style={{ width: "100%", height: 400 }}>
        <ResponsiveContainer>
          <RadarChart data={radarData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="vehicleType" />
            <PolarRadiusAxis angle={30} domain={[0, 1]} />
            <Radar
              name="Avg Confidence"
              dataKey="avgConfidence"
              stroke="#8884d8"
              fill="#8884d8"
              fillOpacity={0.6}
            />
            <Tooltip />
            <Legend />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default VehicleConfidenceRadarChart;
