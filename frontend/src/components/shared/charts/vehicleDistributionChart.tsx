"use client";

import React, { useMemo } from "react";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

// Register required Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

export interface Event {
  id: number;
  vehicleType: string;
}

export interface VehicleDistributionChartProps {
  data: Event[];
}

const VehicleDistributionChart: React.FC<VehicleDistributionChartProps> = ({ data }) => {
  // Aggregate vehicle type counts
  const distribution = useMemo(() => {
    const counts: Record<string, number> = {};
    data.forEach((event) => {
      counts[event.vehicleType] = (counts[event.vehicleType] || 0) + 1;
    });
    return counts;
  }, [data]);

  const labels = Object.keys(distribution);
  const values = labels.map((label) => distribution[label]);

  const chartData = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: labels.map((_, index) => getColor(index)),
      },
    ],
  };

  // Utility: Get color from a preset palette
  function getColor(index: number) {
    const colors = [
      "#4bc0c0", "#ff6384", "#36a2eb", "#ffce56", "#9966ff",
      "#ff9f40", "#c9cbcf", "#8366ff", "#ff6666", "#66ff66"
    ];
    return colors[index % colors.length];
  }

  return (
    <div className="p-4 bg-white shadow rounded-lg">
      <h3 className="text-lg font-medium mb-4">Vehicle Distribution</h3>
      <Pie
        data={chartData}
        options={{
          responsive: true,
          plugins: {
            legend: { position: "bottom" }, // ✅ Legend stays at the bottom
            title: { display: true, text: "Vehicle Distribution" },
          },
        }}
      />
    </div>
  );
};

export default VehicleDistributionChart;
