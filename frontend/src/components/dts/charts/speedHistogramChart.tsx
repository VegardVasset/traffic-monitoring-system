"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  BarController,
  Title,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  BarController,
  Title,
  Tooltip,
  Legend
);

import React, { useMemo } from "react";
import { Bar } from "react-chartjs-2";
import type { ChartOptions } from "chart.js";
import { BaseEvent } from "@/context/DataContext";

interface SpeedEvent extends BaseEvent {
  speed?: number;
}

interface SpeedHistogramChartProps {
  data: SpeedEvent[];
}

export default function SpeedHistogramChart({ data }: SpeedHistogramChartProps) {

  const binEdges = useMemo(() => [0, 20, 40, 60, 80, 100, 120, 140, 160, 180, 200], []);

  const binCounts = useMemo(() => {
    const counts = new Array(binEdges.length - 1).fill(0);

    data.forEach((evt) => {
      if (typeof evt.speed === "number") {
        for (let i = 0; i < binEdges.length - 1; i++) {
          if (evt.speed >= binEdges[i] && evt.speed < binEdges[i + 1]) {
            counts[i]++;
            break;
          }
        }
      }
    });

    return counts;
  }, [data, binEdges]);

  const chartData = useMemo(() => {
    const labels = [];
    for (let i = 0; i < binEdges.length - 1; i++) {
      labels.push(`${binEdges[i]}-${binEdges[i + 1]}`);
    }

    return {
      labels,
      datasets: [
        {
          label: "Speed Distribution",
          data: binCounts,
          backgroundColor: "rgba(53, 162, 235, 0.5)",  
          borderColor: "rgba(53, 162, 235, 1)",
          borderWidth: 1,
        },
      ],
    };
  }, [binCounts, binEdges]);

  const chartOptions: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        title: {
          display: true,
          text: "Speed Range (km/h)",
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Count",
        },
        ticks: {
          precision: 0,
          callback: (value) => Number(value).toFixed(0),
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: "Speed Histogram",
      },
    },
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div style={{ height: 400 }}>
        <Bar data={chartData} options={chartOptions} />
      </div>
    </div>
  );
}