"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { Line } from "react-chartjs-2";
import TimeSeriesChartHeader from "./TimeSeriesChartHeader";
import useIsMobile from "./hooks/useIsMobile";
import useAggregatedData from "./hooks/useAggregatedData";
import useForecastEntry from "./hooks/useForecastEntry";
import useChartData from "./hooks/useChartData";

import {
  Chart as ChartJS,
  ChartOptions,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export interface Event {
  id: number;
  creationTime: string; // e.g. "2025-01-01T12:34:56Z"
  vehicleType: string;
}

export interface AggregatedDataEntry {
  binKey: string; // e.g. "2024-12-30"
  date: string;   // e.g. "Week 1, 2025"
  [vehicleType: string]: number | string;
}

export interface TimeSeriesChartProps {
  data: Event[];
  binSize: "hour" | "day" | "week" | "month";
  startDate: string;  // e.g. "2025-01-01"
  onDataPointClick?: (binKey: string) => void;
  disableForecast?: boolean;
  /**
   * If true (default), filter out bins before `startDate`.
   * In a drilldown, you might pass false if you want to see partial bins, etc.
   */
  applyDateFilter?: boolean;
}

export default function TimeSeriesChart({
  data,
  binSize,
  startDate,
  onDataPointClick,
  disableForecast = false,
  applyDateFilter = true,
}: TimeSeriesChartProps) {
  const isMobile = useIsMobile();
  const chartRef = useRef<ChartJS<"line"> | null>(null);
  const [showForecast, setShowForecast] = useState(false);

  // Reset forecast toggle whenever binSize changes
  useEffect(() => {
    setShowForecast(false);
  }, [binSize]);

  // 1) Aggregate the raw data by bin
  const { aggregatedData, vehicleTypes } = useAggregatedData(data, binSize);

  // 2) Optionally filter out bins that are before the startDate
  const filteredAggregatedData = useMemo(() => {
    if (!applyDateFilter) {
      return aggregatedData;
    }
    return aggregatedData.filter(
      (entry) => new Date(entry.binKey) >= new Date(startDate)
    );
  }, [aggregatedData, startDate, applyDateFilter]);

  // 3) Possibly compute a forecast entry
  const forecastEntry = useForecastEntry(filteredAggregatedData, binSize, vehicleTypes, disableForecast);

  // 4) Build final chartData
  const { chartData } = useChartData(filteredAggregatedData, forecastEntry, vehicleTypes, isMobile, showForecast);

  // 5) On click, get the binKey from the data index
  const handleChartClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!chartRef.current) return;
    const elements = chartRef.current.getElementsAtEventForMode(
      event.nativeEvent,
      "nearest",
      { intersect: true },
      false
    );
    if (elements.length > 0) {
      const index = elements[0].index;
      const clickedBinKey = filteredAggregatedData[index]?.binKey;
      if (clickedBinKey && onDataPointClick) {
        onDataPointClick(clickedBinKey);
      }
    }
  };

  // 6) Chart options
  const lineChartOptions: ChartOptions<"line"> = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 1000, easing: "easeOutQuart" },
      scales: {
        x: {
          ticks: { font: { size: isMobile ? 10 : 12 }, autoSkip: true, maxTicksLimit: isMobile ? 4 : 10 },
          grid: { color: "rgba(200,200,200,0.2)", borderDash: [2, 2] },
        },
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0,
            callback: (value) => Number(value).toFixed(0),
            font: { size: isMobile ? 10 : 12 },
          },
          grid: { color: "rgba(200,200,200,0.2)", borderDash: [2, 2] },
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "rgba(0,0,0,0.7)",
          titleFont: { size: isMobile ? 10 : 14 },
          bodyFont: { size: isMobile ? 8 : 12 },
          borderColor: "rgba(255,255,255,0.8)",
          borderWidth: 1,
          callbacks: {
            label: (tooltipItem) =>
              ` ${tooltipItem.dataset.label}: ${tooltipItem.raw}`,
          },
        },
      },
    }),
    [isMobile]
  );

  return (
    <div className="flex flex-col w-full h-full">
      <TimeSeriesChartHeader
        binSize={binSize}
        disableForecast={disableForecast}
        aggregatedDataLength={filteredAggregatedData.length}
        showForecast={showForecast}
        onToggleForecast={() => setShowForecast(!showForecast)}
      />
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
