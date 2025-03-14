"use client";

import React, { useMemo } from "react";
import { Chart as ChartJS, LinearScale, Tooltip, Legend } from "chart.js";
import { Chart } from "react-chartjs-2";
import { MatrixController, MatrixElement } from "chartjs-chart-matrix";

// Register Chart.js components and the matrix plugin.
ChartJS.register(LinearScale, Tooltip, Legend, MatrixController, MatrixElement);

// Adjust this interface if your data has different fields or optional fields.
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

// Helper function to compute an ISO week identifier for a given date.
function getWeekNumber(date: Date): string {
  // Copy date so we don't modify the original.
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  // ISO week date weeks start on Monday.
  const dayNum = d.getUTCDay() || 7; // Sunday is 0, make it 7.
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${weekNo}`;
}

export default function HeatmapChart({ data, isMobile = false }: HeatmapChartProps) {
  // 1) Count how many unique weeks are in the data.
  const totalWeeks = useMemo(() => {
    const weekSet = new Set<string>();
    data.forEach((evt) => {
      weekSet.add(getWeekNumber(new Date(evt.creationTime)));
    });
    return weekSet.size || 1; // Avoid division by 0 if there's no data.
  }, [data]);

  // 2) Sum up passenger counts per day/hour in a 7×24 matrix.
  const averagedArr = useMemo(() => {
    const sumArr = Array.from({ length: 7 }, () => Array(24).fill(0));
    data.forEach((evt) => {
      const date = new Date(evt.creationTime);
      const day = date.getDay(); // 0=Sun ... 6=Sat
      const hour = date.getHours(); // 0..23
      sumArr[day][hour] += evt.passengerCount;
    });
    // Compute average (divide by the number of weeks).
    return sumArr.map((row) => row.map((val) => Math.round(val / totalWeeks)));
  }, [data, totalWeeks]);

  // 3) Days of the week (y-axis labels) and hours (x-axis labels).
  const daysOfWeek = useMemo(() => ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], []);
  const xLabels = useMemo(() => Array.from({ length: 24 }, (_, i) => `${i}`), []);

  // 4) Set up quantized color scale thresholds for a custom legend.
  const flatValues = averagedArr.flat();
  const minValue = Math.min(...flatValues);
  const maxValue = Math.max(...flatValues);

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

  let thresholds: number[] = [];
  if (maxValue === minValue) {
    thresholds = Array.from({ length: nBuckets + 1 }, () => minValue);
  } else {
    const step = (maxValue - minValue) / nBuckets;
    thresholds = Array.from({ length: nBuckets + 1 }, (_, i) => Math.round(minValue + i * step));
  }

  // Function to determine the color for a given value.
  const getColorForValue = (value: number) => {
    for (let i = 0; i < nBuckets; i++) {
      if (value >= thresholds[i] && value <= thresholds[i + 1]) {
        return quantColors[i];
      }
    }
    return quantColors[nBuckets - 1];
  };

  // 5) Prepare the matrix data points for Chart.js.
  // Each data point represents a cell with x (hour), y (day) and v (passenger count).
  const matrixData = useMemo(() => {
    const points: { x: string; y: string; v: number; backgroundColor: string }[] = [];
    for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
      for (let hour = 0; hour < 24; hour++) {
        const value = averagedArr[dayIndex][hour];
        points.push({
          x: hour.toString(),
          y: daysOfWeek[dayIndex],
          v: value,
          backgroundColor: getColorForValue(value),
        });
      }
    }
    return points;
  }, [averagedArr, daysOfWeek, thresholds]);

  // 6) Chart.js data configuration.
  const chartData = useMemo(
    () => ({
      datasets: [
        {
          label: "Passenger Count Heatmap",
          data: matrixData,
          // Compute cell dimensions based on chart area.
          width: ({ chart }: { chart: ChartJS }) =>
            chart.chartArea ? chart.chartArea.width / 24 : 0,
          height: ({ chart }: { chart: ChartJS }) =>
            chart.chartArea ? chart.chartArea.height / 7 : 0,
          // Use the precomputed backgroundColor for each cell.
          backgroundColor: (ctx: any) => {
            const index = ctx.dataIndex;
            return matrixData[index].backgroundColor;
          },
          borderColor: "#E2E2E2",
          borderWidth: 1,
        },
      ],
    }),
    [matrixData]
  );

  // 7) Chart.js options (conditionals for mobile).
  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        tooltip: {
          callbacks: {
            title: (context: any) => {
              const item = context[0];
              return `${item.raw.y} – ${item.raw.x}:00`;
            },
            label: (context: any) => `${context.raw.v} passengers`,
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
            // Smaller font on mobile
            font: { size: isMobile ? 10 : 14 },
          },
          ticks: {
            // Smaller tick font on mobile
            font: { size: isMobile ? 8 : 12 },
          },
          grid: { display: false },
          // Keep offset on desktop, turn it off on mobile
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

  // 8) Prepare legend items.
  const legendItems = useMemo(
    () =>
      quantColors.map((color, i) => ({
        color,
        range: `${thresholds[i]} – ${thresholds[i + 1]}`,
      })),
    [quantColors, thresholds]
  );

  // Use a smaller container on mobile to fit better
  const containerStyle = { minHeight: isMobile ? 200 : 400 };

  return (
    <div className="flex flex-col w-full h-full">
      <h2 className="ml-4 text-xs md:text-xl font-semibold mb-4">
        Average Passenger Count per Hour
      </h2>
      <div style={containerStyle}>
        <Chart type="matrix" data={chartData} options={options} />
      </div>
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
            <span style={{ fontSize: isMobile ? 10 : 12 }}>{item.range}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
