"use client";

import React, { useMemo } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  Plugin,
} from "chart.js";
import { BaseEvent } from "@/context/DataContext";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface TireEvent extends BaseEvent {
  tireCondition?: number; // e.g. 1-5
}

interface TireConditionChartProps {
  data: BaseEvent[];
}

export default function TireConditionChart({ data }: TireConditionChartProps) {
  // Tally up tireCondition counts
  const tireConditionCounts = useMemo(() => {
    const initial: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    data.forEach((evt) => {
      const event = evt as TireEvent;
      if (
        typeof event.tireCondition === "number" &&
        event.tireCondition >= 1 &&
        event.tireCondition <= 5
      ) {
        initial[event.tireCondition] += 1;
      }
    });
    return initial;
  }, [data]);

  // Prepare bar chart data
  const chartData = useMemo(
    () => ({
      labels: [
        "1 (Poor)",
        "2 (Fair)",
        "3 (Good)",
        "4 (Very Good)",
        "5 (Excellent)",
      ],
      datasets: [
        {
          label: "Tire Condition Count",
          data: [
            tireConditionCounts[1],
            tireConditionCounts[2],
            tireConditionCounts[3],
            tireConditionCounts[4],
            tireConditionCounts[5],
          ],
          backgroundColor: [
            "rgba(220, 53, 69, 0.6)", // Red
            "rgba(255, 193, 7, 0.6)",  // Yellow
            "rgba(40, 167, 69, 0.6)",  // Green
            "rgba(0, 123, 255, 0.6)",  // Blue
            "rgba(111, 66, 193, 0.6)", // Purple
          ],
          borderColor: [
            "rgba(220, 53, 69, 1)",
            "rgba(255, 193, 7, 1)",
            "rgba(40, 167, 69, 1)",
            "rgba(0, 123, 255, 1)",
            "rgba(111, 66, 193, 1)",
          ],
          borderWidth: 1,
        },
      ],
    }),
    [tireConditionCounts]
  );

  // Optional plugin for data labels on top of bars
  const dataLabelsPlugin: Plugin<"bar"> = {
    id: "dataLabels",
    afterDatasetsDraw: (chart) => {
      const { ctx } = chart;
      chart.data.datasets.forEach((dataset, datasetIndex) => {
        const meta = chart.getDatasetMeta(datasetIndex);
        meta.data.forEach((bar, index) => {
          const value = dataset.data[index] as number;
          if (value > 0) {
            ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
            ctx.font = "bold 12px Arial";
            ctx.textAlign = "center";
            ctx.fillText(value.toString(), bar.x, bar.y - 5);
          }
        });
      });
    },
  };

  // Chart options with integer Y-axis formatting
  const chartOptions: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: "Tire Conditions (1-5)",
        font: { size: 16, weight: "bold" },
        color: "#333",
      },
    },
    scales: {
      x: { ticks: { color: "#555" } },
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
        <Bar data={chartData} options={chartOptions} plugins={[dataLabelsPlugin]} />
      </div>
      <p className="text-sm text-gray-600 mt-2">
        Tire Condition Scale: 1 = Poor, 5 = Excellent.
      </p>
    </div>
  );
}
