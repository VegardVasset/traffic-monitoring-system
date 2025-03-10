"use client";

import React, { useMemo, useState, useEffect } from "react";
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
} from "chart.js";
import type { ChartOptions } from "chart.js";
import { getChartColor } from "@/lib/chartUtils";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export interface Event {
  id: number;
  creationTime: string;
  vehicleType: string;
}

export interface TimeSeriesChartProps {
  data: Event[];
  binSize: "hour" | "day" | "week" | "month";
}

type BinnedCounts = Record<string, Record<string, number>>;
type AggregatedDataEntry = {
  date: string;
  [vehicleType: string]: number | string;
};

function useIsMobile(maxWidth = 550) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkSize = () => setIsMobile(window.innerWidth <= maxWidth);
    checkSize();
    window.addEventListener("resize", checkSize);
    return () => window.removeEventListener("resize", checkSize);
  }, [maxWidth]);
  return isMobile;
}

function getHourBinKey(date: Date): string {
  return date.toISOString().substring(0, 13);
}
function getDayBinKey(date: Date): string {
  return date.toISOString().substring(0, 10);
}
function getWeekBinKey(date: Date): string {
  const startOfWeek = new Date(date);
  startOfWeek.setHours(0, 0, 0, 0);
  let day = startOfWeek.getDay();
  if (day === 0) day = 7;
  startOfWeek.setDate(startOfWeek.getDate() - (day - 1));
  return startOfWeek.toISOString().substring(0, 10);
}
function getMonthBinKey(date: Date): string {
  return date.toISOString().substring(0, 7);
}

function formatBinLabel(binKey: string, binSize: "hour" | "day" | "week" | "month"): string {
  if (binSize === "hour") {
    const date = new Date(binKey + ":00:00Z");
    return formatHour(date);
  } else if (binSize === "day") {
    const date = new Date(binKey);
    return formatDate(date);
  } else if (binSize === "week") {
    const startOfWeek = new Date(binKey);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    return `${formatDate(startOfWeek)} - ${formatDate(endOfWeek)}`;
  } else {
    const date = new Date(binKey + "-01T00:00:00Z");
    return formatMonth(date);
  }
}

function formatDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear()).slice(-2);
  return `${day}/${month}/${year}`;
}

function formatHour(date: Date): string {
  const base = formatDate(date);
  const hour = String(date.getHours()).padStart(2, "0");
  return `${base} ${hour}:00`;
}

function formatMonth(date: Date): string {
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
}

export default function TimeSeriesChart({ data, binSize }: TimeSeriesChartProps) {
  const isMobile = useIsMobile();
  const vehicleTypes = useMemo(() => {
    const types = new Set<string>();
    data.forEach((e) => types.add(e.vehicleType));
    return Array.from(types);
  }, [data]);

  const getBinKey = useMemo(() => {
    switch (binSize) {
      case "hour":
        return getHourBinKey;
      case "day":
        return getDayBinKey;
      case "week":
        return getWeekBinKey;
      case "month":
        return getMonthBinKey;
      default:
        return getDayBinKey;
    }
  }, [binSize]);

  const binnedCounts: BinnedCounts = useMemo(() => {
    const counts: BinnedCounts = {};
    data.forEach((event) => {
      const eventDate = new Date(event.creationTime);
      const binKey = getBinKey(eventDate);
      if (!counts[binKey]) {
        counts[binKey] = {};
        vehicleTypes.forEach((type) => {
          counts[binKey][type] = 0;
        });
      }
      counts[binKey][event.vehicleType] = (counts[binKey][event.vehicleType] || 0) + 1;
    });
    return counts;
  }, [data, vehicleTypes, getBinKey]);

  const sortedBinKeys = useMemo(() => {
    return Object.keys(binnedCounts).sort();
  }, [binnedCounts]);

  const aggregatedData: AggregatedDataEntry[] = useMemo(() => {
    return sortedBinKeys.map((binKey) => ({
      date: formatBinLabel(binKey, binSize),
      ...binnedCounts[binKey],
    }));
  }, [sortedBinKeys, binnedCounts, binSize]);

  const datasets = useMemo(() => {
    return vehicleTypes.map((type, index) => ({
      label: type,
      data: aggregatedData.map((row) => (row[type] as number) || 0),
      borderColor: getChartColor(index),
      backgroundColor: getChartColor(index, 0.5),
      fill: false,
      borderWidth: isMobile ? 1 : 2,
      pointRadius: isMobile ? 1 : 2,
      pointHoverRadius: isMobile ? 3 : 4,
    }));
  }, [aggregatedData, vehicleTypes, isMobile]);

  const chartData = {
    labels: aggregatedData.map((entry) => entry.date),
    datasets,
  };

  const lineChartOptions: ChartOptions<"line"> = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        ticks: {
          font: {
            size: isMobile ? 10 : 12,
          },
          autoSkip: true,
          maxTicksLimit: isMobile ? 4 : 10,
        },
      },
      y: {
        ticks: {
          font: {
            size: isMobile ? 10 : 12,
          },
        },
      },
    },
    plugins: {
      legend: {
        display: false,
        position: "bottom",
        labels: {
          boxWidth: isMobile ? 6 : 12,
          font: {
            size: isMobile ? 6 : 14,
          },
        },
      },
      tooltip: {
        bodyFont: {
          size: isMobile ? 4 : 12,
        },
      },
      datalabels: {
        display: false,
      },
    },
  }), [isMobile]);

  return (
    <div className="flex flex-col w-full h-full">
      <h2 className="ml-4 text-xs md:text-xl font-semibold mb-4">
        Passings Over Time ({binSize})
      </h2>
      <div className="flex-1 relative h-full">
        <Line data={chartData} options={lineChartOptions} />
      </div>
    </div>
  );
}
