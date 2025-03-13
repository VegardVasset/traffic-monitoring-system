"use client";

import React, { useMemo } from "react";
import { ResponsiveHeatMap, ComputedCell } from "@nivo/heatmap";

export interface PassengerEvent {
  id: number;
  creationTime: string; // e.g. "2025-03-13T10:12:43Z"
  vehicleType: string;
  passengerCount: number;
}

interface HeatmapChartProps {
  data: PassengerEvent[];
}

// Helper function to compute an ISO week identifier for a given date.
function getWeekNumber(date: Date): string {
  // Copy date so don't modify original.
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  // ISO week date weeks start on Monday.
  const dayNum = d.getUTCDay() || 7; // Sunday is 0, make it 7.
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${weekNo}`;
}

export default function HeatmapChart({ data }: HeatmapChartProps) {
  // 1) Calculate the total number of unique weeks in the data.
  const totalWeeks = useMemo(() => {
    const weekSet = new Set<string>();
    data.forEach((evt) => {
      weekSet.add(getWeekNumber(new Date(evt.creationTime)));
    });
    return weekSet.size || 1; // Avoid division by 0.
  }, [data]);

  // 2) Sum up the passenger counts per day/hour.
  // We'll use a 7×24 matrix where rows are days (0=Sun … 6=Sat) and columns are hours.
  const averagedArr = useMemo(() => {
    const sumArr = Array.from({ length: 7 }, () => Array(24).fill(0));
    data.forEach((evt) => {
      const date = new Date(evt.creationTime);
      const day = date.getDay(); // 0=Sun ... 6=Sat
      const hour = date.getHours(); // 0..23
      sumArr[day][hour] += evt.passengerCount;
    });
    // Now compute average per hour slot over the weeks.
    return sumArr.map((row) =>
      row.map((val) => Math.round(val / totalWeeks))
    );
  }, [data, totalWeeks]);

  // 3) Days of the week for row labels.
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // 4) Convert our 7×24 average matrix into the series format Nivo HeatMap expects.
  const heatmapData = useMemo(() => {
    return daysOfWeek.map((dayName, dayIndex) => ({
      id: dayName,
      data: Array.from({ length: 24 }, (_, hour) => ({
        x: `${hour}`, // hour as label
        y: averagedArr[dayIndex][hour],
      })),
    }));
  }, [averagedArr, daysOfWeek]);

  // 5) Compute thresholds for a custom legend.
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
    thresholds = Array.from({ length: nBuckets + 1 }, (_, i) => minValue + i * step);
  }
  thresholds = thresholds.map(Math.round);
  const legendItems = quantColors.map((color, i) => ({
    color,
    range: `${thresholds[i]} – ${thresholds[i + 1]}`,
  }));

  return (
    <div className="flex flex-col w-full h-full" style={{ minHeight: 400 }}>
      <h2 className="ml-4 text-xs md:text-xl font-semibold mb-4">
        Average Passenger Count per Hour
      </h2>
      <div className="flex relative w-full h-full">
        {/* Heatmap */}
        <div className="flex-1">
          <ResponsiveHeatMap
            data={heatmapData}
            margin={{ top: 50, right: 20, bottom: 60, left: 60 }}
            theme={{
              text: { fontSize: 12 },
              axis: {
                domain: { line: { stroke: "#777777", strokeWidth: 1 } },
                ticks: {
                  line: { stroke: "#777777", strokeWidth: 1 },
                  text: { fill: "#333333" },
                },
              },
              grid: { line: { stroke: "#dddddd", strokeWidth: 1 } },
            }}
            // Display whole numbers in the cells.
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
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: "Hour",
              legendPosition: "middle",
              legendOffset: 40,
            }}
            axisLeft={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: "Day",
              legendPosition: "middle",
              legendOffset: -50,
            }}
            enableLabels={true}
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
        {/* Custom Legend */}
        <div className="flex flex-col items-start justify-center ml-4">
          <div className="text-sm font-semibold mb-2">
            Average passenger count
          </div>
          {legendItems.map((item, i) => (
            <div key={i} className="flex items-center mb-1">
              <div
                style={{
                  backgroundColor: item.color,
                  width: 20,
                  height: 20,
                  marginRight: 5,
                }}
              />
              <span style={{ fontSize: 12 }}>{item.range}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
