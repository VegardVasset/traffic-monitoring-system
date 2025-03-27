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

    return sums.map((sum, i) => (counts[i] ? Math.round(sum / counts[i]) : 0));
  }, [data]);

  const labels = useMemo(
    () => Array.from({ length: 24 }, (_, i) => i.toString()),
    []
  );

  const [minSpeed, maxSpeed] = useMemo(() => {
    const validSpeeds = hourlyAverages.filter(
      (val) => typeof val === "number" && !isNaN(val)
    );
    if (!validSpeeds.length) {
      return [0, 100];
    }
    const localMin = Math.min(...validSpeeds);
    const localMax = Math.max(...validSpeeds);

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
          tension: 0.3, 
        },
      ],
    }),
    [labels, hourlyAverages]
  );

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