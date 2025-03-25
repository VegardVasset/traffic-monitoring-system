"use client";

import React, { useMemo, useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { MOBILE_MAX_WIDTH } from "@/config/config";
import { getChartColor } from "@/lib/chartUtils";

// Register the Bar chart
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export interface PassengerEvent {
  id: number;
  vehicleType: string;
  passengerCount: number;
}

interface PeopleCountChartProps {
  data: PassengerEvent[];
}

export default function PeopleCountChart({
  data,
}: PeopleCountChartProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= MOBILE_MAX_WIDTH);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 1) Compute average passenger count per vehicle type
  const { labels, averages } = useMemo(() => {
    const sums: Record<string, number> = {};
    const counts: Record<string, number> = {};

    data.forEach((evt) => {
      if (!sums[evt.vehicleType]) {
        sums[evt.vehicleType] = 0;
        counts[evt.vehicleType] = 0;
      }
      sums[evt.vehicleType] += evt.passengerCount;
      counts[evt.vehicleType] += 1;
    });

    const vehicleTypes = Object.keys(sums);
    const avgValues = vehicleTypes.map((type) =>
      counts[type] > 0 ? Math.round(sums[type] / counts[type]) : 0
    );

    return {
      labels: vehicleTypes,
      averages: avgValues,
    };
  }, [data]);

  // 2) Prepare chart data
  const chartData = {
    labels,
    datasets: [
      {
        label: "Avg Passengers",
        data: averages,
        backgroundColor: labels.map((_, i) => getChartColor(i, 0.8)),
      },
    ],
  };

  // 3) Bar chart options
  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        ticks: {
          font: {
            size: isMobile ? 10 : 12,
          },
        },
      },
      y: {
        ticks: {
          precision: 0,
          callback: function (tickValue: string | number) {
            return Number(tickValue).toFixed(0);
          },
          font: {
            size: isMobile ? 10 : 12,
          },
          beginAtZero: true,
        },
      },
    },
    plugins: {
      datalabels: {
        display: false,
      },
      legend: {
        display: false,
        position: "bottom" as const,
      },
      tooltip: {
        callbacks: {
          label: (context: { parsed: { y: number } }) => {
            const value = context.parsed.y;
            return `Avg: ${Math.round(value)}`;
          },
        },
      },
    },
  };

  return (
    <div className="flex flex-col w-full h-full">
      <h2 className="ml-4 text-xs md:text-xl font-semibold mb-4">
        Average Passenger Count by Vehicle Type
      </h2>
      <div className="flex-1 relative">
        <Bar data={chartData} options={barChartOptions} />
      </div>
    </div>
  );
}
