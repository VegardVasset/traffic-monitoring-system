"use client";

import React, { useMemo } from "react";
import { ResponsiveHeatMap, ComputedCell } from "@nivo/heatmap";

// Adjust this interface if your data has different fields or optional fields
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

  // 3) Days of the week (row labels) wrapped in useMemo to ensure stability.
  const daysOfWeek = useMemo(() => ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], []);

  // 4) Convert the 7×24 matrix into Nivo HeatMap data format.
  const heatmapData = useMemo(() => {
    return daysOfWeek.map((dayName, dayIndex) => ({
      id: dayName,
      data: Array.from({ length: 24 }, (_, hour) => ({
        x: `${hour}`, // label on the X-axis
        y: averagedArr[dayIndex][hour],
      })),
    }));
  }, [averagedArr, daysOfWeek]);

  // 5) Set up quantized color scale thresholds for a custom legend.
  const flatValues = averagedArr.flat();
  const minValue = Math.min(...flatValues);
  const maxValue = Math.max(...flatValues);

  // These are the color buckets.
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
    // If all values are the same, create repeated thresholds
    thresholds = Array.from({ length: nBuckets + 1 }, () => minValue);
  } else {
    const step = (maxValue - minValue) / nBuckets;
    thresholds = Array.from({ length: nBuckets + 1 }, (_, i) => minValue + i * step);
  }
  thresholds = thresholds.map(Math.round);

  const legendItems = quantColors.map((color, i) => ({
    color,
    range: `${thresholds[i]} – ${thresholds[i + 1]}`,
  }));

  // 6) Adjust styling for mobile vs. desktop.
  const margin = isMobile
    ? { top: 30, right: 10, bottom: 40, left: 40 }
    : { top: 50, right: 20, bottom: 60, left: 60 };
  const fontSize = isMobile ? 8 : 12;

  return (
    <div
      className="flex flex-col w-full h-full"
      style={{ minHeight: isMobile ? 300 : 400 }}
    >
      <h2 className="ml-4 text-xs md:text-xl font-semibold mb-4">
        Average Passenger Count per Hour
      </h2>

      {/* The chart */}
      <div className="relative flex-1 w-full h-full">
        <ResponsiveHeatMap
          isInteractive={!isMobile}
          data={heatmapData}
          margin={margin}
          theme={{
            text: { fontSize },
            axis: {
              domain: { line: { stroke: "#777777", strokeWidth: 1 } },
              ticks: {
                line: { stroke: "#777777", strokeWidth: 1 },
                text: { fill: "#333333" },
              },
            },
            grid: { line: { stroke: "#dddddd", strokeWidth: 1 } },
          }}
          valueFormat=">-.0f"
          colors={{
            type: "quantize",
            colors: quantColors,
          }}
          emptyColor="#F8F8F8"
          borderColor="#E2E2E2"
          axisTop={null}
          axisRight={null}
          axisBottom={{
            tickSize: isMobile ? 3 : 5,
            tickPadding: isMobile ? 3 : 5,
            tickRotation: 0,
            legend: "Hour",
            legendPosition: "middle",
            legendOffset: isMobile ? 30 : 40,
          }}
          axisLeft={{
            tickSize: isMobile ? 3 : 5,
            tickPadding: isMobile ? 3 : 5,
            tickRotation: 0,
            legend: "Day",
            legendPosition: "middle",
            legendOffset: isMobile ? -35 : -50,
          }}
          // Hide the numeric labels inside each cell on mobile for clarity
          labelTextColor={{ from: "color", modifiers: [["darker", 1.8]] }}
          hoverTarget="cell"
          tooltip={({ cell }: { cell: ComputedCell<{ x: string; y: number }> }) => (
            <div
              style={{
                background: "white",
                padding: "5px",
                border: "1px solid #ccc",
              }}
            >
              <strong>
                {cell.serieId} – {cell.x}:00
              </strong>{" "}
              {cell.value} passengers
            </div>
          )}
        />
      </div>

      {/* Custom Legend (placed below the chart) */}
      <div className="flex flex-row flex-wrap items-center justify-center mt-2">
        <div className="text-sm font-semibold mb-2 w-full text-center">
          Average passenger count
        </div>
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
