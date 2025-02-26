"use client";

import React, { useMemo } from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import type { ChartOptions } from "chart.js";
import { getChartColor } from "@/lib/chartUtils";

ChartJS.register(ArcElement, Tooltip, Legend);

export interface Event {
  id: number;
  vehicleType: string;
}

export interface VehicleDistributionChartProps {
  data: Event[];
}

export default function VehicleDistributionChart({
  data,
}: VehicleDistributionChartProps) {
  // 1) Aggregate vehicle-type counts
  const distribution = useMemo(() => {
    const counts: Record<string, number> = {};
    data.forEach((event) => {
      counts[event.vehicleType] = (counts[event.vehicleType] || 0) + 1;
    });
    return counts;
  }, [data]);

  // 2) Chart labels & values
  const labels = Object.keys(distribution);
  const values = labels.map((label) => distribution[label]);

  // 3) Build chartData
  const chartData = useMemo(() => {
    return {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: labels.map((_, i) => getChartColor(i, 0.8)),
        },
      ],
    };
  }, [labels, values]);

  // 4) Chart options
  const pieChartOptions: ChartOptions<"pie"> = {
    responsive: true,
    maintainAspectRatio: false, // Fill the parent's height
    layout: {
      padding: {
        bottom: 30, // some extra space for the legend
      },
    },
    plugins: {
      legend: {
        display: false, // or true if you want the legend always
        position: "bottom",
        onClick: () => {},
        labels: {
          pointStyle: "circle",
          usePointStyle: true,
          font: {
            size: 12,
          },
          padding: 10,
        },
      },
      title: {
        display: false,
      },
    },
    animation: {
      duration: 0,
    },
  };

  return (
    <div className="flex flex-col w-full h-full">
      <h2 className="text-xs md:text-xl font-semibold mb-4">
        Vehicle Distribution
      </h2>
      <div className="flex-1 relative">
        <Pie data={chartData} options={pieChartOptions} />
      </div>
    </div>
  );
}
