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
} from "chart.js";
import { useData, BaseEvent } from "@/context/DataContext";

// Register the necessary chart components.
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Define a TireEvent interface that extends BaseEvent.
interface TireEvent extends BaseEvent {
  tireCondition?: number;
}

export default function TireConditionChart() {
  const { data } = useData();

  const counts = useMemo(() => {
    // Initialize counts for tire conditions 1-5.
    const initial: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    data.forEach((event) => {
      const tireEvent = event as TireEvent;
      const condition = tireEvent.tireCondition;
      if (typeof condition === "number" && condition >= 1 && condition <= 5) {
        initial[condition] += 1;
      }
    });
    return initial;
  }, [data]);

  const chartData = useMemo(
    () => ({
      labels: ["1", "2", "3", "4", "5"],
      datasets: [
        {
          label: "Tire Condition Count",
          data: [counts[1], counts[2], counts[3], counts[4], counts[5]],
          backgroundColor: "rgba(75,192,192,0.6)",
        },
      ],
    }),
    [counts]
  );

  const options: ChartOptions<"bar"> = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: "Tire Conditions (1-5)" },
    },
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Tire Conditions</h2>
      <Bar data={chartData} options={options} />
    </div>
  );
}
