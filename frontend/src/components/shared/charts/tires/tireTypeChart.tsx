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
  binSize: "hour" | "day" | "week" | "month";
}

// Helper to build a grouping key based on binSize
function getTimeBinKey(date: Date, binSize: "hour" | "day" | "week" | "month"): string {
  switch (binSize) {
    case "hour":
      // e.g. "2025-03-10T14"
      return date.toISOString().substring(0, 13);
    case "day":
      // e.g. "2025-03-10"
      return date.toISOString().substring(0, 10);
    case "week": {
      // Calculate an approximate ISO week number
      const year = date.getFullYear();
      const firstDayOfYear = new Date(year, 0, 1);
      const pastDaysOfYear = (date.valueOf() - firstDayOfYear.valueOf()) / 86400000;
      const weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
      return `${year}-W${String(weekNumber).padStart(2, "0")}`;
    }
    case "month":
      // e.g. "2025-03"
      return date.toISOString().substring(0, 7);
    default:
      return date.toISOString().substring(0, 10);
  }
}

// Helper to format label from key
function formatLabel(key: string, binSize: "hour" | "day" | "week" | "month"): string {
  switch (binSize) {
    case "hour": {
      // "YYYY-MM-DDTHH"
      const date = new Date(key + ":00:00.000Z");
      return date.toLocaleString("en-GB", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    }
    case "day": {
      // "YYYY-MM-DD"
      const date = new Date(key);
      return date.toLocaleDateString("en-GB", {
        month: "short",
        day: "numeric",
      });
    }
    case "week":
      // Return key as is (or format further if desired)
      return key;
    case "month": {
      // "YYYY-MM" → format to "Mar 2025"
      const [year, month] = key.split("-");
      const date = new Date(parseInt(year), parseInt(month) - 1);
      return date.toLocaleDateString("en-GB", {
        month: "short",
        year: "numeric",
      });
    }
    default:
      return key;
  }
}

export default function TireTypeChart({ data, binSize }: TireTypeChartProps) {
  // Build trends based on binSize
  const tireTypeTrends = useMemo(() => {
    const trends: Record<string, { vinterdekk: number; sommerdekk: number }> = {};

    data.forEach((evt) => {
      const event = evt as TireEvent;
      if (!event.tireType || !event.creationTime) return;
      const date = new Date(event.creationTime);
      if (isNaN(date.getTime())) return;

      const key = getTimeBinKey(date, binSize);
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
    const formattedLabels = sortedKeys.map((key) => formatLabel(key, binSize));

    return {
      labels: formattedLabels,
      vinterdekk: sortedKeys.map((key) => trends[key].vinterdekk),
      sommerdekk: sortedKeys.map((key) => trends[key].sommerdekk),
    };
  }, [data, binSize]);

  // Chart data
  const chartData = useMemo(() => ({
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
  }), [tireTypeTrends]);

  // Chart options
  const chartOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" },
      title: {
        display: true,
        text: "Tire Type Trends Over Time",
        font: { size: 16, weight: "bold" },
        color: "#333",
      },
    },
    scales: {
      x: {
        title: { display: true, text: "Time" },
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
      <div className="relative w-full h-[400px]">
        <Line data={chartData} options={chartOptions} />
      </div>
      <p className="text-sm text-gray-600 mt-2">
        Distribution of Vinterdekk and Sommerdekk over time, based on your chosen interval.
      </p>
    </div>
  );
}
