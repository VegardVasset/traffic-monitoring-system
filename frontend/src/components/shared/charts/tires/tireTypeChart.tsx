"use client";

import React, { useMemo } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";
import { BaseEvent } from "@/context/DataContext";

// Register the necessary Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface TireEvent extends BaseEvent {
  tireType?: string; // e.g. "vinterdekk" or "sommerdekk"
}

interface TireTypeChartProps {
  data: BaseEvent[];
}

export default function TireTypeChart({ data }: TireTypeChartProps) {
  // Build monthly trends
  const tireTypeTrends = useMemo(() => {
    const trends: Record<string, { vinterdekk: number; sommerdekk: number }> = {};

    data.forEach((evt) => {
      const event = evt as TireEvent;
      if (!event.tireType || !event.creationTime) return;
      const date = new Date(event.creationTime);
      if (isNaN(date.getTime())) return;

      const key = date.toISOString().substring(0, 7); // e.g. "2025-02"
      if (!trends[key]) {
        trends[key] = { vinterdekk: 0, sommerdekk: 0 };
      }

      if (event.tireType.toLowerCase() === "vinterdekk") {
        trends[key].vinterdekk += 1;
      } else if (event.tireType.toLowerCase() === "sommerdekk") {
        trends[key].sommerdekk += 1;
      }
    });

    // Sort keys chronologically
    const sortedKeys = Object.keys(trends).sort((a, b) => a.localeCompare(b));
    const formattedLabels = sortedKeys.map((key) => {
      const [year, month] = key.split("-");
      const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December",
      ];
      return `${monthNames[parseInt(month, 10) - 1]} ${year}`;
    });

    return {
      labels: formattedLabels,
      vinterdekk: sortedKeys.map((key) => trends[key].vinterdekk),
      sommerdekk: sortedKeys.map((key) => trends[key].sommerdekk),
    };
  }, [data]);

  // Chart data
  const chartData = useMemo(
    () => ({
      labels: tireTypeTrends.labels,
      datasets: [
        {
          label: "Vinterdekk",
          data: tireTypeTrends.vinterdekk,
          borderColor: "rgba(75, 192, 192, 1)",
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          fill: true,
          tension: 0.1,
        },
        {
          label: "Sommerdekk",
          data: tireTypeTrends.sommerdekk,
          borderColor: "rgba(255, 99, 132, 1)",
          backgroundColor: "rgba(255, 99, 132, 0.2)",
          fill: true,
          tension: 0.1,
        },
      ],
    }),
    [tireTypeTrends]
  );

  // Chart options
  const chartOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" },
      title: {
        display: true,
        text: "Tire Type Trends Over Months",
        font: { size: 16, weight: "bold" },
        color: "#333",
      },
    },
    scales: {
      x: {
        title: { display: true, text: "Month" },
        ticks: { color: "#555" },
      },
      y: {
        beginAtZero: true,
        title: { display: true, text: "Count" },
        ticks: { color: "#555" },
      },
    },
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      {/* Fixed container for the chart */}
      <div className="relative w-full h-[400px]">
        <Line data={chartData} options={chartOptions} />
      </div>
      <p className="text-sm text-gray-600 mt-2">
        Distribution of Vinterdekk and Sommerdekk over time, highlighting seasonal trends.
      </p>
    </div>
  );
}
