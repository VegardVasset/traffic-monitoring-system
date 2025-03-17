"use client";

import React, { useMemo } from "react";
import {
  Chart as ChartJS,
  LinearScale,
  Tooltip,
  Legend,
  ScriptableContext,
  TooltipItem,
} from "chart.js";
import { Chart } from "react-chartjs-2";
import { MatrixController, MatrixElement } from "chartjs-chart-matrix";

// Register Chart.js components and the matrix plugin.
ChartJS.register(LinearScale, Tooltip, Legend, MatrixController, MatrixElement);

export interface PassengerEvent {
  id: number;
  creationTime: string; // e.g. "2025-03-13T10:12:43Z"
  vehicleType: string;
  passengerCount: number;
}

interface HeatmapChartProps {
  data: PassengerEvent[];
  /** Whether we're on a mobile viewport. */
  isMobile?: boolean;
}

/** 
 * Converts Sunday=0, Monday=1, etc. into Monday=0, Tuesday=1, ... Sunday=6.
 * getDay() => 0..6 => [Sun..Sat]
 * We want => [Mon=0..Sun=6].
 */
function mapDayIndex(originalDay: number): number {
  // Sunday (0) -> 6
  // Monday (1) -> 0
  // Tuesday (2) -> 1
  // Wednesday (3) -> 2
  // Thursday (4) -> 3
  // Friday (5) -> 4
  // Saturday (6) -> 5
  const reorderMap = [6, 0, 1, 2, 3, 4, 5];
  return reorderMap[originalDay];
}

/** Represents one cell in the heatmap. */
interface MatrixDataPoint {
  x: string; // hour
  y: string; // day label
  v: number; // passenger sum
}

// Discrete color scale array (original "before" colors).
const quantColors = [
  "#fef0d9",
  "#fdd49e",
  "#fdbb84",
  "#fc8d59",
  "#ef6548",
  "#d7301f",
  "#b30000",
];
const nBuckets = quantColors.length;

/** 
 * Returns a discrete color based on thresholds 
 * derived from minValue..maxValue.
 */
function createDiscreteColorFunc(minValue: number, maxValue: number) {
  // Build thresholds array
  let thresholds: number[] = [];
  if (maxValue === minValue) {
    thresholds = Array.from({ length: nBuckets + 1 }, () => minValue);
  } else {
    const step = (maxValue - minValue) / nBuckets;
    thresholds = Array.from({ length: nBuckets + 1 }, (_, i) =>
      Math.round(minValue + i * step)
    );
  }

  // The function that picks the color
  return (value: number) => {
    for (let i = 0; i < nBuckets; i++) {
      if (value >= thresholds[i] && value <= thresholds[i + 1]) {
        return quantColors[i];
      }
    }
    return quantColors[nBuckets - 1];
  };
}

export default function HeatmapChart({ data, isMobile = false }: HeatmapChartProps) {
  // 1) Create a 7×24 matrix for passenger sums (no averaging).
  const matrixArr = useMemo(() => {
    const sumArr = Array.from({ length: 7 }, () => Array(24).fill(0));
    data.forEach((evt) => {
      const date = new Date(evt.creationTime);
      const mappedDay = mapDayIndex(date.getDay());
      const hour = date.getHours();
      sumArr[mappedDay][hour] += evt.passengerCount;
    });
    return sumArr;
  }, [data]);

  // 2) Days of the week (re-labeled so Monday=0, Sunday=6).
  const daysOfWeek = useMemo(() => ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], []);
  const xLabels = useMemo(() => Array.from({ length: 24 }, (_, i) => i.toString()), []);

  // 3) Compute min/max passenger counts for the entire matrix (for color scale).
  const flatValues = matrixArr.flat();
  const minValue = Math.min(...flatValues);
  const maxValue = Math.max(...flatValues);

  // 4) Create a discrete color function based on minValue and maxValue
  const getColorForValue = useMemo(
    () => createDiscreteColorFunc(minValue, maxValue),
    [minValue, maxValue]
  );

  // 5) Prepare the matrix data points for Chart.js.
  // Each data point represents a cell with x (hour), y (day) and v (passenger count).
  const matrixData = useMemo<MatrixDataPoint[]>(() => {
    const points: MatrixDataPoint[] = [];
    for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
      for (let hour = 0; hour < 24; hour++) {
        const value = matrixArr[dayIndex][hour];
        points.push({
          x: hour.toString(),
          y: daysOfWeek[dayIndex],
          v: value,
        });
      }
    }
    return points;
  }, [matrixArr, daysOfWeek]);

  // 6) Chart.js data configuration.
  const chartData = useMemo(
    () => ({
      datasets: [
        {
          label: "Passenger Count Heatmap",
          data: matrixData,
          width: ({ chart }: { chart: ChartJS }) =>
            chart.chartArea ? chart.chartArea.width / 24 : 0,
          height: ({ chart }: { chart: ChartJS }) =>
            chart.chartArea ? chart.chartArea.height / 7 : 0,
          backgroundColor: (ctx: ScriptableContext<"matrix">) => {
            const idx = ctx.dataIndex;
            const v = matrixData[idx].v;
            return getColorForValue(v);
          },
          borderColor: "#E2E2E2",
          borderWidth: 1,
        },
      ],
    }),
    [matrixData, getColorForValue]
  );

  // 7) Chart.js options (conditionals for mobile).
  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        // If you have chartjs-plugin-datalabels globally registered,
        // disable it for this chart to avoid text overlays:
        datalabels: {
          display: false,
        },
        tooltip: {
          callbacks: {
            title: (items: TooltipItem<"matrix">[]) => {
              if (!items.length) return "";
              const raw = items[0].raw as MatrixDataPoint;
              return `${raw.y} – ${raw.x}:00`;
            },
            label: (item: TooltipItem<"matrix">) => {
              const raw = item.raw as MatrixDataPoint;
              return `${raw.v} passengers`;
            },
          },
        },
        legend: {
          display: false,
        },
      },
      scales: {
        x: {
          type: "category" as const,
          labels: xLabels,
          title: {
            display: true,
            text: "Hour",
            font: { size: isMobile ? 10 : 14 },
          },
          ticks: {
            font: { size: isMobile ? 8 : 12 },
          },
          grid: { display: false },
          offset: true,
        },
        y: {
          type: "category" as const,
          labels: daysOfWeek,
          title: {
            display: true,
            text: "Day",
            font: { size: isMobile ? 10 : 14 },
          },
          ticks: {
            font: { size: isMobile ? 8 : 12 },
          },
          grid: { display: false },
          offset: true,
        },
      },
    }),
    [xLabels, daysOfWeek, isMobile]
  );

  // 8) Build discrete legend items from thresholds
  const legendItems = useMemo(() => {
    // Rebuild thresholds in the same way as createDiscreteColorFunc
    let thresholds: number[] = [];
    if (maxValue === minValue) {
      thresholds = Array.from({ length: nBuckets + 1 }, () => minValue);
    } else {
      const step = (maxValue - minValue) / nBuckets;
      thresholds = Array.from({ length: nBuckets + 1 }, (_, i) =>
        Math.round(minValue + i * step)
      );
    }

    // Pair each color with a range label like "0–1", "2–3", etc.
    return quantColors.map((color, i) => {
      const rangeStart = thresholds[i];
      const rangeEnd = thresholds[i + 1];
      return {
        color,
        rangeLabel: `${rangeStart} – ${rangeEnd}`,
      };
    });
  }, [minValue, maxValue]);

  // Use a smaller container on mobile to fit better
  const containerStyle = { minHeight: isMobile ? 200 : 400 };

  return (
    <div className="flex flex-col w-full h-full">
      <h2 className="ml-4 text-xs md:text-xl font-semibold mb-4">
        Weekly Heatmap of Passenger Counts (Mon–Sun)
      </h2>
      <div style={containerStyle}>
        <Chart type="matrix" data={chartData} options={options} />
      </div>
      {/* Discrete Legend */}
      <div className="flex flex-row flex-wrap items-center justify-center mt-2">
        {legendItems.map((item, i) => (
          <div key={i} className="flex items-center mr-4 mb-2">
            <div
              style={{
                backgroundColor: item.color,
                width: isMobile ? 12 : 20,
                height: isMobile ? 12 : 20,
                marginRight: 5,
              }}
            />
            <span style={{ fontSize: isMobile ? 10 : 12 }}>{item.rangeLabel}</span>
          </div>
        ))}
      </div>
    </div>
  );
}