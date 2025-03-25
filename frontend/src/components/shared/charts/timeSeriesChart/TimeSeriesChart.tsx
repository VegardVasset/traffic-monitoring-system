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
  creationTime: string;
  vehicleType: string;
}

export interface AggregatedDataEntry {
  binKey: string;
  date: string;
  [vehicleType: string]: number | string;
}

export interface TimeSeriesChartProps {
  data: Event[];
  binSize: "hour" | "day" | "week" | "month";
  onDataPointClick?: (binKey: string) => void;
  disableForecast?: boolean;
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

  // Hide forecast whenever binSize changes.
  useEffect(() => {
    setShowForecast(false);
  }, [binSize]);

  // Aggregation & Forecast hooks.
  const { aggregatedData, vehicleTypes } = useAggregatedData(data, binSize);
  const forecastEntry = useForecastEntry(aggregatedData, binSize, vehicleTypes, disableForecast);

  // Build chart data from aggregated data and forecast.
  const { chartData } = useChartData(aggregatedData, forecastEntry, vehicleTypes, isMobile, showForecast);

  // Chart options.
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

  // Chart click handler: passes clicked bin key to parent callback.
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
      const clickedBinKey = aggregatedData[index]?.binKey;
      if (clickedBinKey && onDataPointClick) {
        onDataPointClick(clickedBinKey);
      }
    }
  };

  return (
    <div className="flex flex-col w-full h-full">
      <TimeSeriesChartHeader
        binSize={binSize}
        disableForecast={disableForecast}
        aggregatedDataLength={aggregatedData.length}
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
