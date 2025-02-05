// components/charts/VehicleDistributionChart.tsx
"use client";

import React, { useMemo } from "react";
import { Pie } from "react-chartjs-2";
import { ChartData } from "chart.js";

export interface Event {
  id: number;
  vehicleType: string;
  // add other fields as needed
}

export interface VehicleDistributionChartProps {
  data: Event[];
}

const VehicleDistributionChart: React.FC<VehicleDistributionChartProps> = ({ data }) => {
  // Aggregate counts per vehicle type.
  const distribution = useMemo(() => {
    const counts: Record<string, number> = {};
    data.forEach((event) => {
      counts[event.vehicleType] = (counts[event.vehicleType] || 0) + 1;
    });
    return counts;
  }, [data]);

  const labels = Object.keys(distribution);
  const values = labels.map((label) => distribution[label]);

  const chartData: ChartData<"pie"> = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: labels.map((_, index) => getColor(index)),
      },
    ],
  };

  // Utility: Get a color from a preset palette.
  function getColor(index: number, opacity: number = 0.6) {
    const colors = [
      `rgba(75,192,192,${opacity})`,
      `rgba(255,99,132,${opacity})`,
      `rgba(54,162,235,${opacity})`,
      `rgba(255,206,86,${opacity})`,
      `rgba(153,102,255,${opacity})`,
      `rgba(255,159,64,${opacity})`,
      `rgba(199,199,199,${opacity})`,
      `rgba(83,102,255,${opacity})`,
      `rgba(255,102,102,${opacity})`,
      `rgba(102,255,102,${opacity})`,
    ];
    return colors[index % colors.length];
  }

  return (
    <div className="bg-white shadow rounded-lg p-4">
      <h3 className="text-lg font-medium mb-4">Vehicle Distribution</h3>
      <Pie
        data={chartData}
        options={{
          responsive: true,
          plugins: {
            legend: { position: "bottom" },
            title: { display: true, text: "Vehicle Distribution" },
          },
        }}
      />
    </div>
  );
};

export default VehicleDistributionChart;
