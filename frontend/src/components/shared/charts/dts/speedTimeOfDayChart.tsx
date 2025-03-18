"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  Title,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  Title,
  Tooltip,
  Legend
);

import React, { useMemo } from "react";
import { Line } from "react-chartjs-2";
import { BaseEvent } from "@/context/DataContext";

interface SpeedEvent extends BaseEvent {
  speed?: number;
}

interface SpeedTimeOfDayChartProps {
  data: SpeedEvent[];
}

export default function SpeedTimeOfDayChart({ data }: SpeedTimeOfDayChartProps) {
  /**
   * We'll group events by hour of the day (0-23),
   * then calculate the average speed for each hour,
   * rounding to the nearest integer.
   */
  const hourlyAverages = useMemo(() => {
    const sums = new Array(24).fill(0);
    const counts = new Array(24).fill(0);

    data.forEach((evt) => {
      if (typeof evt.speed === "number") {
        const hour = new Date(evt.creationTime).getHours();
        sums[hour] += evt.speed;
        counts[hour]++;
      }
    });

    // Compute the average per hour and round
    return sums.map((sum, i) => (counts[i] ? Math.round(sum / counts[i]) : 0));
  }, [data]);

  // Build Chart.js data
  const labels = useMemo(
    () => Array.from({ length: 24 }, (_, i) => i.toString()),
    []
  );

  // Compute dynamic min/max for the Y-axis
  const [minSpeed, maxSpeed] = useMemo(() => {
    // Filter out invalid/NaN values
    const validSpeeds = hourlyAverages.filter(
      (val) => typeof val === "number" && !isNaN(val)
    );
    if (!validSpeeds.length) {
      // No valid data: fallback to some safe range
      return [0, 100];
    }
    const localMin = Math.min(...validSpeeds);
    const localMax = Math.max(...validSpeeds);

    // Provide a small margin so data doesn't hug the chart edges
    const margin = 5;
    const safeMin = localMin - margin < 0 ? 0 : localMin - margin;
    const safeMax = localMax + margin;
    return [safeMin, safeMax];
  }, [hourlyAverages]);

  const chartData = useMemo(
    () => ({
      labels,
      datasets: [
        {
          label: "Avg Speed (km/h)",
          data: hourlyAverages,
          borderColor: "rgba(75,192,192,1)",
          backgroundColor: "rgba(75,192,192,0.2)",
          fill: true,
          tension: 0.3, // curve the line slightly
        },
      ],
    }),
    [labels, hourlyAverages]
  );

  // Basic chart options with dynamic min/max
  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          title: {
            display: true,
            text: "Hour of Day (0-23)",
          },
        },
        y: {
          min: minSpeed,
          max: maxSpeed,
          beginAtZero: false,
          title: {
            display: true,
            text: "Avg Speed (km/h)",
          },
          ticks: {
            // Show whole numbers on the y-axis
            callback: (value: number | string) => Number(value).toFixed(0),
          },
        },
      },
      plugins: {
        legend: {
          display: true,
          position: "top" as const,
        },
        title: {
          display: true,
          text: "Average Speed by Hour",
        },
      },
    }),
    [minSpeed, maxSpeed]
  );

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div style={{ height: 400 }}>
        <Line data={chartData} options={chartOptions} />
      </div>
    </div>
  );
}