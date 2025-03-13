"use client";

import React, { useMemo, useState, useEffect, useRef } from "react";
import { MOBILE_MAX_WIDTH } from "@/config/config";
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
import { formatTimeBin } from "@/lib/timeFormattingUtils";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export interface Event {
  id: number;
  creationTime: string;
  vehicleType: string;
}

export interface TimeSeriesChartProps {
  data: Event[];
  binSize: "hour" | "day" | "week" | "month";
  onDataPointClick?: (binKey: string) => void;
}

type BinnedCounts = Record<string, Record<string, number>>;
type AggregatedDataEntry = {
  binKey: string;
  date: string;
  [vehicleType: string]: number | string;
};

function useIsMobile(maxWidth = MOBILE_MAX_WIDTH) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkSize = () => setIsMobile(window.innerWidth <= maxWidth);
    checkSize();
    window.addEventListener("resize", checkSize);
    return () => window.removeEventListener("resize", checkSize);
  }, [maxWidth]);
  return isMobile;
}

// Bin key helper functions remain unchanged
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

export default function TimeSeriesChart({ data, binSize, onDataPointClick }: TimeSeriesChartProps) {
  const isMobile = useIsMobile();

  // Collect vehicle types from the data
  const vehicleTypes = useMemo(() => {
    const types = new Set<string>();
    data.forEach((e) => types.add(e.vehicleType));
    return Array.from(types);
  }, [data]);

  // Choose the appropriate bin key function
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

  // Aggregate the data by bin key
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

  const sortedBinKeys = useMemo(() => Object.keys(binnedCounts).sort(), [binnedCounts]);

  // Build final data array using the utility for label formatting
  const aggregatedData: AggregatedDataEntry[] = useMemo(() => {
    return sortedBinKeys.map((binKey) => ({
      binKey,
      date: formatTimeBin(binKey, binSize),
      ...binnedCounts[binKey],
    }));
  }, [sortedBinKeys, binnedCounts, binSize]);

  // Build chart datasets
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

  const chartData = useMemo(() => ({
    labels: aggregatedData.map((entry) => entry.date),
    datasets,
  }), [aggregatedData, datasets]);

  // Configure Y-axis to show only whole numbers
  const lineChartOptions: ChartOptions<"line"> = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        ticks: {
          font: { size: isMobile ? 10 : 12 },
          autoSkip: true,
          maxTicksLimit: isMobile ? 4 : 10,
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
          callback: (value) => Number(value).toFixed(0),
          font: { size: isMobile ? 10 : 12 },
        },
      },
    },
    plugins: {
      legend: {
        display: false,
        position: "bottom",
        labels: {
          boxWidth: isMobile ? 6 : 12,
          font: { size: isMobile ? 6 : 14 },
        },
      },
      tooltip: { bodyFont: { size: isMobile ? 4 : 12 } },
      datalabels: { display: false },
    },
  }), [isMobile]);

  // Updated: use specific types instead of any
  const chartRef = useRef<ChartJS<"line"> | null>(null);

  const handleChartClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!chartRef.current) return;
    const elements = chartRef.current.getElementsAtEventForMode(
      event.nativeEvent,
      "nearest",
      { intersect: true },
      false
    );
    if (elements.length > 0) {
      const firstElement = elements[0];
      const index = firstElement.index;
      const clickedBinKey = aggregatedData[index]?.binKey;
      if (clickedBinKey && onDataPointClick) {
        onDataPointClick(clickedBinKey);
      }
    }
  };

  return (
    <div className="flex flex-col w-full h-full">
      <h2 className="ml-4 text-xs md:text-xl font-semibold mb-4">
        Passings Over Time ({binSize})
      </h2>
      <div className="flex-1 relative h-full">
        <Line
          ref={chartRef}
          data={chartData}
          options={lineChartOptions}
          onClick={handleChartClick}
        />
      </div>
    </div>
  );
}
