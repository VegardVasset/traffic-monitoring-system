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

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export interface Event {
  id: number;
  creationTime: string;
  vehicleType: string;
}

export interface TimeSeriesChartProps {
  data: Event[];
  vehicleTypes: string[];
  binSize: "hour" | "day" | "week";
}

// Define a type for the aggregated data entries
type AggregatedDataEntry = {
  date: string;
} & {
  [key: string]: number | string;
};

const TimeSeriesChart: React.FC<TimeSeriesChartProps> = ({ data, vehicleTypes, binSize }) => {
  // Binning function based on binSize
  const binningFunction = useMemo(() => {
    const binFormat: Record<"hour" | "day" | "week", (date: Date) => string> = {
      hour: (date) => date.toISOString().substring(0, 13), // "YYYY-MM-DDTHH"
      day: (date) => date.toISOString().substring(0, 10),  // "YYYY-MM-DD"
      week: (date) => {
        const startOfWeek = new Date(date);
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); // Start of the week
        return startOfWeek.toISOString().substring(0, 10); // "YYYY-MM-DD"
      },
    };

    return binFormat[binSize] || binFormat["day"]; // Default to "day" if binSize is undefined
  }, [binSize]);

  // Aggregate data based on binning function
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

  // Prepare datasets for Chart.js
  const datasets = useMemo(() => {
    return vehicleTypes.map((type, index) => ({
      label: type,
      data: aggregatedData.map((entry) => (entry[type] as number) || 0),
      borderColor: getColor(index),
      backgroundColor: getColor(index, 0.5),
      fill: false,
    }));
  }, [aggregatedData, vehicleTypes]);

  const chartData = {
    labels: aggregatedData.map((entry) => entry.date),
    datasets,
  };

  // Utility: Get color from a preset palette
  function getColor(index: number, opacity: number = 1) {
    const colors = [
      `rgba(75,192,192,${opacity})`,
      `rgba(255,99,132,${opacity})`,
      `rgba(54,162,235,${opacity})`,
      `rgba(255,206,86,${opacity})`,
      `rgba(153,102,255,${opacity})`,
      `rgba(255,159,64,${opacity})`,
      `rgba(199,199,199,${opacity})`,
      `rgba(83,102,255,${opacity})`,
      `rgba(255,102,102,${opacity})`,
      `rgba(102,255,102,${opacity})`,
    ];
    return colors[index % colors.length];
  }

  return (
    <div className="p-4 bg-white shadow rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Events Over Time</h2>
      <div className="relative w-full" style={{ height: "400px" }}>
        <Line
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { position: "top" },
              title: { display: true, text: `Binned by ${binSize}` },
            },
          }}
        />
      </div>
    </div>
  );
};

export default TimeSeriesChart;
