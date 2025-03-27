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

ChartJS.register(LinearScale, Tooltip, Legend, MatrixController, MatrixElement);

export interface PassengerEvent {
  id: number;
  creationTime: string; 
  vehicleType: string;
  passengerCount: number;
}

interface HeatmapChartProps {
  data: PassengerEvent[];
  isMobile?: boolean;
}


function mapDayIndex(originalDay: number): number {
  const reorderMap = [6, 0, 1, 2, 3, 4, 5];
  return reorderMap[originalDay];
}

interface MatrixDataPoint {
  x: string; 
  y: string; 
  v: number; 
}

const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const xLabels = Array.from({ length: 24 }, (_, i) => i.toString());
const quantColors = ["#fef0d9", "#fdd49e", "#fdbb84", "#fc8d59", "#ef6548", "#d7301f", "#b30000"];
const nBuckets = quantColors.length;


function createDiscreteColorFunc(minValue: number, maxValue: number) {
  let thresholds: number[] = [];

  if (maxValue === minValue) {
    thresholds = Array.from({ length: nBuckets + 1 }, (_, i) => minValue + i);
  } else {
    const step = (maxValue - minValue) / nBuckets;
    thresholds = Array.from({ length: nBuckets + 1 }, (_, i) =>
      Math.round(minValue + i * step)
    );
  }

  return (value: number) => {
    for (let i = 0; i < nBuckets; i++) {
      if (value >= thresholds[i] && value < thresholds[i + 1]) {
        return quantColors[i];
      }
    }
    return quantColors[nBuckets - 1]; 
  };
}

export default function HeatmapChart({ data, isMobile = false }: HeatmapChartProps) {
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

  const flatValues = matrixArr.flat();
  const minValue = Math.min(...flatValues);
  const maxValue = Math.max(...flatValues);
  const getColorForValue = useMemo(() => createDiscreteColorFunc(minValue, maxValue), [minValue, maxValue]);

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
  }, [matrixArr]);

  const chartData = useMemo(
    () => ({
      datasets: [
        {
          label: "Passenger Count Heatmap",
          data: matrixData,
          width: ({ chart }: { chart: ChartJS }) =>
            chart.chartArea ? chart.chartArea.width / 24 : 20, 
          height: ({ chart }: { chart: ChartJS }) =>
            chart.chartArea ? chart.chartArea.height / 7 : 20,
          backgroundColor: (ctx: ScriptableContext<"matrix">) => {
            const idx = ctx.dataIndex;
            const v = matrixData[idx]?.v ?? 0;
            return getColorForValue(v);
          },
          borderColor: "#E2E2E2",
          borderWidth: 1,
        },
      ],
    }),
    [matrixData, getColorForValue]
  );

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        datalabels: { display: false },
        tooltip: {
          callbacks: {
            title: (items: TooltipItem<"matrix">[]) => {
              if (!items.length || !items[0].raw) return "Unknown Time";
              const raw = items[0].raw as MatrixDataPoint;
              return `${raw.y} – ${raw.x}:00`;
            },
            label: (item: TooltipItem<"matrix">) => {
              const raw = item.raw as MatrixDataPoint;
              return raw ? `${raw.v} passengers` : "No data";
            },
          },
        },
        legend: { display: false },
      },
      scales: {
        x: {
          type: "category" as const,
          labels: xLabels,
          title: { display: true, text: "Hour", font: { size: isMobile ? 10 : 14 } },
          ticks: { font: { size: isMobile ? 8 : 12 } },
          grid: { display: false },
          offset: true,
        },
        y: {
          type: "category" as const,
          labels: daysOfWeek,
          title: { display: true, text: "Day", font: { size: isMobile ? 10 : 14 } },
          ticks: { font: { size: isMobile ? 8 : 12 } },
          grid: { display: false },
          offset: true,
        },
      },
    }),
    [isMobile]
  );

  const legendItems = useMemo(() => {
    const thresholds = maxValue === minValue
      ? Array.from({ length: nBuckets + 1 }, (_, i) => minValue + i)
      : Array.from({ length: nBuckets + 1 }, (_, i) =>
          Math.round(minValue + i * ((maxValue - minValue) / nBuckets))
        );

    return quantColors.map((color, i) => ({
      color,
      rangeLabel: `${thresholds[i]} – ${thresholds[i + 1]}`,
    }));
  }, [minValue, maxValue]);

  return (
    <div className="flex flex-col w-full h-full">
      <h2 className="ml-4 text-xs md:text-xl font-semibold mb-4">
        Weekly Heatmap of Passenger Counts
      </h2>
      <div style={{ minHeight: isMobile ? 200 : 400 }}>
        <Chart type="matrix" data={chartData} options={options} />
      </div>
      <div className="flex flex-row flex-wrap items-center justify-center mt-2">
        {legendItems.map((item, i) => (
          <div key={i} className="flex items-center mr-4 mb-2">
            <div style={{ backgroundColor: item.color, width: isMobile ? 12 : 20, height: isMobile ? 12 : 20, marginRight: 5 }} />
            <span style={{ fontSize: isMobile ? 10 : 12 }}>{item.rangeLabel}</span>
          </div>
        ))}
      </div>
    </div>
  );
}