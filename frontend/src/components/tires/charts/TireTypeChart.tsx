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
import { formatTimeBin } from "@/lib/timeFormattingUtils";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface TireEvent extends BaseEvent {
  tireType?: string; 
}

interface TireTypeChartProps {
  data: BaseEvent[];
  binSize: "hour" | "day" | "week" | "month";
}

export default function TireTypeChart({ data, binSize }: TireTypeChartProps) {
  const tireTypeTrends = useMemo(() => {
    const trends: Record<string, { vinterdekk: number; sommerdekk: number }> = {};

    data.forEach((evt) => {
      const event = evt as TireEvent;
      if (!event.tireType || !event.creationTime) return;
      const date = new Date(event.creationTime);
      if (isNaN(date.getTime())) return;

      let key = "";
      switch (binSize) {
        case "hour":
          key = date.toISOString().substring(0, 13);
          break;
        case "day":
          key = date.toISOString().substring(0, 10);
          break;
        case "week":
          {
            const startOfWeek = new Date(date);
            startOfWeek.setHours(0, 0, 0, 0);
            let day = startOfWeek.getDay();
            if (day === 0) day = 7;
            startOfWeek.setDate(startOfWeek.getDate() - (day - 1));
            key = startOfWeek.toISOString().substring(0, 10);
          }
          break;
        case "month":
          key = date.toISOString().substring(0, 7);
          break;
        default:
          key = date.toISOString().substring(0, 10);
      }
      if (!trends[key]) {
        trends[key] = { vinterdekk: 0, sommerdekk: 0 };
      }

      if (event.tireType.toLowerCase() === "vinterdekk") {
        trends[key].vinterdekk += 1;
      } else if (event.tireType.toLowerCase() === "sommerdekk") {
        trends[key].sommerdekk += 1;
      }
    });

    const sortedKeys = Object.keys(trends).sort((a, b) => a.localeCompare(b));
    const formattedLabels = sortedKeys.map((key) => formatTimeBin(key, binSize));

    return {
      labels: formattedLabels,
      vinterdekk: sortedKeys.map((key) => trends[key].vinterdekk),
      sommerdekk: sortedKeys.map((key) => trends[key].sommerdekk),
    };
  }, [data, binSize]);

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
        ticks: {
          precision: 0,
          callback: (value) => Number(value).toFixed(0),
          color: "#555",
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="relative w-full h-[400px]">
        <Line data={chartData} options={chartOptions} />
      </div>
    </div>
  );
}
