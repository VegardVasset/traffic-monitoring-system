"use client";

import React, { useMemo } from "react";
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
  binSize: "hour" | "day" | "week";
}

type AggregatedDataEntry = {
  date: string;
} & { [key: string]: number | string };

export default function TimeSeriesChart({ data, binSize }: TimeSeriesChartProps) {
  // 1) Derive vehicle types from the data
  const vehicleTypes = useMemo(() => {
    const types = new Set<string>();
    data.forEach((e) => types.add(e.vehicleType));
    return Array.from(types);
  }, [data]);

  // 2) Binning function
  const binningFunction = useMemo(() => {
    const binFormat: Record<"hour" | "day" | "week", (date: Date) => string> = {
      hour: (date) => date.toISOString().substring(0, 13),
      day: (date) => date.toISOString().substring(0, 10),
      week: (date) => {
        const startOfWeek = new Date(date);
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        return startOfWeek.toISOString().substring(0, 10);
      },
    };
    return binFormat[binSize] ?? binFormat.day;
  }, [binSize]);

  // 3) Aggregate data
  const aggregatedData: AggregatedDataEntry[] = useMemo(() => {
    const binnedCounts: Record<string, Record<string, number>> = {};

    data.forEach((event) => {
      const eventDate = new Date(event.creationTime);
      const binKey = binningFunction(eventDate);

      if (!binnedCounts[binKey]) {
        binnedCounts[binKey] = {};
        vehicleTypes.forEach((type) => {
          binnedCounts[binKey][type] = 0;
        });
      }
      binnedCounts[binKey][event.vehicleType]++;
    });

    const sortedBins = Object.keys(binnedCounts).sort();
    return sortedBins.map((binKey) => ({
      date: binKey,
      ...binnedCounts[binKey],
    }));
  }, [data, vehicleTypes, binningFunction]);

  // 4) Build datasets
  const datasets = useMemo(() => {
    return vehicleTypes.map((type, index) => ({
      label: type,
      data: aggregatedData.map((row) => (row[type] as number) || 0),
      borderColor: getChartColor(index),
      backgroundColor: getChartColor(index, 0.5),
      fill: false,
    }));
  }, [aggregatedData, vehicleTypes]);

  const chartData = {
    labels: aggregatedData.map((entry) => entry.date),
    datasets,
  };

  // 5) Chart options
  const lineChartOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        onClick: () => {},
      },
      title: {
        display: true,
        text: `Binned by ${binSize}`,
      },
    },
  };

  return (
    <div className="flex flex-col w-full h-full">
      <h2 className="text-xl font-semibold mb-4">Passings Over Time</h2>
      <div className="flex-1 relative">
        <Line data={chartData} options={lineChartOptions} />
      </div>
    </div>
  );
}
