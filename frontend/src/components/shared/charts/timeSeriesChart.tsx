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
import { Button } from "@/components/ui/button";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export interface Event {
  id: number;
  creationTime: string;
  vehicleType: string;
}

export interface TimeSeriesChartProps {
  /** Data is presumably already filtered by date range, camera, etc. */
  data: Event[];
  binSize: "hour" | "day" | "week" | "month";
  onDataPointClick?: (binKey: string) => void;
  /** When true, forecast functionality is disabled (useful for drill-down charts) */
  disableForecast?: boolean;
}

type BinnedCounts = Record<string, Record<string, number>>;
export type AggregatedDataEntry = {
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

// -------------------- BIN KEY HELPERS --------------------
function getHourBinKey(date: Date): string {
  return date.toISOString().substring(0, 13);
}
function getDayBinKey(date: Date): string {
  return date.toISOString().substring(0, 10);
}
function getWeekBinKey(date: Date): string {
  // Monday-based
  const startOfWeek = new Date(date);
  startOfWeek.setHours(0, 0, 0, 0);
  let day = startOfWeek.getDay();
  if (day === 0) day = 7;
  // Subtract day-1 to move back to Monday
  startOfWeek.setDate(startOfWeek.getDate() - (day - 1));
  return startOfWeek.toISOString().substring(0, 10);
}
function getMonthBinKey(date: Date): string {
  return date.toISOString().substring(0, 7);
}

// -------------------- DATE INCREMENT --------------------
function incrementDate(date: Date, binSize: "hour" | "day" | "week" | "month"): Date {
  const newDate = new Date(date);
  switch (binSize) {
    case "hour":
      newDate.setHours(newDate.getHours() + 1);
      break;
    case "day":
      newDate.setDate(newDate.getDate() + 1);
      break;
    case "week":
      newDate.setDate(newDate.getDate() + 7);
      break;
    case "month":
      newDate.setMonth(newDate.getMonth() + 1);
      break;
  }
  return newDate;
}

/**
 * Convert a binKey to a Date, then increment to get the next binKey.
 */
function getNextBinKey(lastBinKey: string, binSize: "hour" | "day" | "week" | "month"): string {
  let date: Date;
  if (binSize === "month") {
    const [year, month] = lastBinKey.split("-");
    date = new Date(Number(year), Number(month) - 1, 1);
  } else if (binSize === "week" || binSize === "day") {
    date = new Date(lastBinKey.substring(0, 10));
  } else if (binSize === "hour") {
    const dayString = lastBinKey.substring(0, 10);
    const hourString = lastBinKey.substring(11);
    date = new Date(`${dayString}T${hourString}:00:00Z`);
  } else {
    date = new Date(lastBinKey);
  }
  const nextDate = incrementDate(date, binSize);
  if (binSize === "hour") return nextDate.toISOString().substring(0, 13);
  if (binSize === "day" || binSize === "week") return nextDate.toISOString().substring(0, 10);
  if (binSize === "month") return nextDate.toISOString().substring(0, 7);
  return nextDate.toISOString();
}

// ---------------------------------------------------------------------
// Exclude bins that are likely incomplete (current day or month).
// ---------------------------------------------------------------------
function isBinLikelyIncompleteForAveraging(
  binKey: string,
  binSize: "hour" | "day" | "week" | "month"
): boolean {
  const now = new Date();
  const binDate = parseBinKey(binKey, binSize);
  if (binSize === "month") {
    return (
      binDate.getFullYear() === now.getFullYear() &&
      binDate.getMonth() === now.getMonth()
    );
  }
  const binDay = binDate.toISOString().substring(0, 10);
  const nowDay = now.toISOString().substring(0, 10);
  return binDay === nowDay;
}

// Parse binKey -> Date
function parseBinKey(binKey: string, binSize: "hour" | "day" | "week" | "month"): Date {
  if (binSize === "month") {
    const [year, month] = binKey.split("-");
    return new Date(Number(year), Number(month) - 1, 1);
  } else if (binSize === "week" || binSize === "day") {
    return new Date(binKey.substring(0, 10));
  } else if (binSize === "hour") {
    const dayString = binKey.substring(0, 10);
    const hourString = binKey.substring(11);
    return new Date(`${dayString}T${hourString}:00:00Z`);
  }
  return new Date(binKey);
}

// ---------------------------------------------------------------------
// Holt's Linear Trend Forecasting Implementation
// ---------------------------------------------------------------------
/**
 * Calculate forecast using Holt's Linear Trend method for each vehicle type.
 * Only complete bins are used.
 */
function calculateHoltForecast(
  aggregatedData: AggregatedDataEntry[],
  binSize: "hour" | "day" | "week" | "month",
  vehicleTypes: string[],
  alpha = 0.5,
  beta = 0.5
): AggregatedDataEntry | null {
  // Filter out bins that are incomplete.
  const completeData = aggregatedData.filter((entry) =>
    !isBinLikelyIncompleteForAveraging(entry.binKey, binSize)
  );
  if (completeData.length < 2) return null;

  const forecast: Record<string, number> = {};
  vehicleTypes.forEach((type) => {
    const series = completeData.map((entry) => Number(entry[type]) || 0);
    let level = series[0];
    let trend = series.length > 1 ? series[1] - series[0] : 0;
    for (let t = 1; t < series.length; t++) {
      const value = series[t];
      const lastLevel = level;
      level = alpha * value + (1 - alpha) * (lastLevel + trend);
      trend = beta * (level - lastLevel) + (1 - beta) * trend;
    }
    forecast[type] = Math.max(0, Math.round(level + trend));
  });

  // Get the last complete bin key.
  const lastCompleteBinKey = completeData[completeData.length - 1].binKey;
  let nextBinKey = getNextBinKey(lastCompleteBinKey, binSize);
  // If the computed next bin key is incomplete (e.g. today's date), increment until a complete key is found.
  while (isBinLikelyIncompleteForAveraging(nextBinKey, binSize)) {
    nextBinKey = getNextBinKey(nextBinKey, binSize);
  }

  return {
    binKey: nextBinKey,
    date: formatTimeBin(nextBinKey, binSize),
    ...forecast,
  };
}

export default function TimeSeriesChart({
  data,
  binSize,
  onDataPointClick,
  disableForecast = false,
}: TimeSeriesChartProps) {
  const isMobile = useIsMobile();
  const chartRef = useRef<ChartJS<"line"> | null>(null);
  const [showForecast, setShowForecast] = useState(false);

  // -------------------- RESET FORECAST WHEN TIME INTERVAL CHANGES --------------------
  useEffect(() => {
    // When binSize changes, hide the forecast.
    setShowForecast(false);
  }, [binSize]);

  // -------------------- COLLECT VEHICLE TYPES --------------------
  const vehicleTypes = useMemo(() => {
    const types = new Set<string>();
    data.forEach((e) => types.add(e.vehicleType));
    return Array.from(types);
  }, [data]);

  // -------------------- SELECT BIN KEY FUNCTION --------------------
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

  // -------------------- AGGREGATION --------------------
  const binnedCounts = useMemo(() => {
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
      counts[binKey][event.vehicleType] =
        (counts[binKey][event.vehicleType] || 0) + 1;
    });
    return counts;
  }, [data, vehicleTypes, getBinKey]);

  const sortedBinKeys = useMemo(() => Object.keys(binnedCounts).sort(), [binnedCounts]);

  const aggregatedData: AggregatedDataEntry[] = useMemo(() => {
    return sortedBinKeys.map((binKey) => ({
      binKey,
      date: formatTimeBin(binKey, binSize),
      ...binnedCounts[binKey],
    }));
  }, [sortedBinKeys, binnedCounts, binSize]);

  // -------------------- FORECAST (Holt's Linear Trend) --------------------
  const forecastEntry = useMemo((): AggregatedDataEntry | null => {
    if (disableForecast) return null;
    return calculateHoltForecast(aggregatedData, binSize, vehicleTypes, 0.5, 0.5);
  }, [aggregatedData, vehicleTypes, binSize, disableForecast]);

  // -------------------- COMBINED LABELS --------------------
  const combinedLabels = useMemo(() => {
    const actualLabels = aggregatedData.map((entry) => entry.date);
    if (showForecast && forecastEntry) {
      return [...actualLabels, forecastEntry.date];
    }
    return actualLabels;
  }, [aggregatedData, forecastEntry, showForecast]);

  // -------------------- ACTUAL DATASETS --------------------
  const actualDatasets = useMemo(() => {
    return vehicleTypes.map((type, index) => ({
      label: type,
      data: aggregatedData.map((row) => (row[type] as number) || 0),
      borderColor: getChartColor(index),
      backgroundColor: getChartColor(index, 0.5),
      fill: false,
      borderWidth: isMobile ? 1 : 2,
      pointRadius: isMobile ? 4 : 5,
      pointHoverRadius: isMobile ? 5 : 6,
      spanGaps: true,
    }));
  }, [aggregatedData, vehicleTypes, isMobile]);

  // -------------------- FORECAST DATASETS --------------------
  // 1) Forecast Fill with Gradient
  const forecastFillDataset = useMemo(() => {
    if (!showForecast || !forecastEntry) return null;
    const lastIndex = aggregatedData.length - 1;
    const fillData = new Array(aggregatedData.length + 1).fill(null);
    let maxLast = 0;
    let maxForecast = 0;
    vehicleTypes.forEach((type) => {
      const vLast = (aggregatedData[lastIndex][type] as number) || 0;
      const vFcast = (forecastEntry[type] as number) || 0;
      if (vLast > maxLast) maxLast = vLast;
      if (vFcast > maxForecast) maxForecast = vFcast;
    });
    const biggerVal = Math.max(maxLast, maxForecast);
    fillData[lastIndex] = 0;
    fillData[lastIndex + 1] = biggerVal;
    let gradientFill: string | CanvasGradient = "rgba(150, 200, 255, 0.4)";
    if (chartRef.current && chartRef.current.ctx) {
      const ctx = chartRef.current.ctx;
      gradientFill = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height);
      gradientFill.addColorStop(0, "rgba(150, 200, 255, 0.6)");
      gradientFill.addColorStop(1, "rgba(150, 200, 255, 0.1)");
    }
    return {
      label: "Forecast Fill",
      data: fillData,
      backgroundColor: gradientFill,
      borderColor: "transparent",
      fill: true,
      tension: 0,
      pointRadius: 0,
      borderWidth: 0,
      spanGaps: true,
      order: 1,
    };
  }, [showForecast, forecastEntry, aggregatedData, vehicleTypes]);

  // 2) Forecast Lines (dashed)
  const forecastLineDatasets = useMemo(() => {
    if (!showForecast || !forecastEntry) return [];
    const lastIndex = aggregatedData.length - 1;
    return vehicleTypes.map((type, index) => {
      const lineData = new Array(aggregatedData.length + 1).fill(null);
      const lastVal = aggregatedData[lastIndex][type] as number;
      const fVal = forecastEntry[type] as number;
      lineData[lastIndex] = lastVal;
      lineData[lastIndex + 1] = fVal;
      return {
        label: `${type} (Forecast)`,
        data: lineData,
        borderColor: getChartColor(index),
        backgroundColor: getChartColor(index, 0.5),
        fill: false,
        borderDash: [5, 5],
        borderWidth: isMobile ? 1 : 2,
        pointRadius: isMobile ? 4 : 5,
        pointHoverRadius: isMobile ? 5 : 6,
        spanGaps: true,
        order: 2,
      };
    });
  }, [showForecast, forecastEntry, aggregatedData, vehicleTypes, isMobile]);

  // -------------------- COMBINED DATASETS --------------------
  const combinedDatasets = useMemo(() => {
    const ds = [];
    if (forecastFillDataset) ds.push(forecastFillDataset);
    ds.push(...actualDatasets);
    ds.push(...forecastLineDatasets);
    return ds;
  }, [forecastFillDataset, actualDatasets, forecastLineDatasets]);

  const chartData = useMemo(
    () => ({
      labels: combinedLabels,
      datasets: combinedDatasets,
    }),
    [combinedLabels, combinedDatasets]
  );

  // -------------------- CHART OPTIONS --------------------
  const lineChartOptions: ChartOptions<"line"> = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 1000,
        easing: "easeOutQuart",
      },
      scales: {
        x: {
          ticks: {
            font: { size: isMobile ? 10 : 12 },
            autoSkip: true,
            maxTicksLimit: isMobile ? 4 : 10,
          },
          grid: {
            color: "rgba(200,200,200,0.2)",
            borderDash: [2, 2],
          },
        },
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0,
            callback: (value) => Number(value).toFixed(0),
            font: { size: isMobile ? 10 : 12 },
          },
          grid: {
            color: "rgba(200,200,200,0.2)",
            borderDash: [2, 2],
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
        tooltip: {
          backgroundColor: "rgba(0,0,0,0.7)",
          titleFont: { size: isMobile ? 10 : 14 },
          bodyFont: { size: isMobile ? 8 : 12 },
          borderColor: "rgba(255,255,255,0.8)",
          borderWidth: 1,
          callbacks: {
            label: (tooltipItem) => ` ${tooltipItem.dataset.label}: ${tooltipItem.raw}`,
          },
        },
        datalabels: { display: false },
      },
    }),
    [isMobile]
  );

  // -------------------- CLICK HANDLER --------------------
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

  // -------------------- RENDER --------------------
  return (
    <div className="flex flex-col w-full h-full">
      {/* Header with Forecast Toggle */}
      <div className="flex items-center justify-between px-2">
        <h2 className="text-xs md:text-xl font-semibold mb-4">
          Passings Over Time ({binSize})
        </h2>
        {/* Only show forecast toggle if not disabled and binSize isn't "hour" */}
        {binSize !== "hour" && !disableForecast && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowForecast(!showForecast)}
            disabled={aggregatedData.length < 2}
          >
            {showForecast ? "Hide Forecast" : "Show Forecast"}
          </Button>
        )}
      </div>
      <div className="flex-1 relative h-full">
        <Line ref={chartRef} data={chartData} options={lineChartOptions} onClick={handleChartClick} />
      </div>
    </div>
  );
}