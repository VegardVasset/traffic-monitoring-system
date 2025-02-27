"use client";

import React, { useMemo, useState, useEffect } from "react";
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

// Custom hook to detect mobile screens
function useIsMobile(maxWidth = 550) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkSize = () => {
      setIsMobile(window.innerWidth <= maxWidth);
    };
    checkSize();
    window.addEventListener("resize", checkSize);
    return () => window.removeEventListener("resize", checkSize);
  }, [maxWidth]);

  return isMobile;
}

export default function TimeSeriesChart({ data, binSize }: TimeSeriesChartProps) {
  // Detect if on mobile
  const isMobile = useIsMobile();

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
        startOfWeek.setHours(0, 0, 0, 0);

        let day = startOfWeek.getDay(); // 0..6, with 0 = Sunday
        if (day === 0) day = 7; // Make Sunday day 7
        startOfWeek.setDate(startOfWeek.getDate() - (day - 1));
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
      // Use different values depending on screen size
      borderWidth: isMobile ? 1 : 2,
      pointRadius: isMobile ? 1 : 2,
      pointHoverRadius: isMobile ? 3 : 4,
    }));
  }, [aggregatedData, vehicleTypes, isMobile]);

  // 5) Chart data
  const chartData = {
    labels: aggregatedData.map((entry) => entry.date),
    datasets,
  };

  // 6) Chart options
  // We dynamically set font sizes and whether the legend is displayed.
  const lineChartOptions: ChartOptions<"line"> = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false, // Enable aspect ratio control
   
      scales: {
        x: {
          ticks: {
            font: {
              size: isMobile ? 8 : 12,
            },
            autoSkip: true,
            maxTicksLimit: isMobile ? 4 : 10,
          },
        },
        y: {
          ticks: {
            font: {
              size: isMobile ? 8 : 12,
            },
          },
        },
      },
      plugins: {
        legend: {
          display: !isMobile,
          position: "bottom",
          labels: {
            boxWidth: isMobile ? 8 : 12,
            font: {
              size: isMobile ? 8 : 14,
            },
          },
        },
        tooltip: {
          bodyFont: {
            size: isMobile ? 8 : 12,
          },
        },
        datalabels: {
          display: false, // Disable datalabels for this chart
        },
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isMobile, binSize]
  );

  return (
    <div className="flex flex-col w-full h-full">
      <h2 className="ml-4 text-xs md:text-xl font-semibold mb-4">
  Passings Over Time ({binSize})
</h2>

      {/* 
        Give the chart container a set height (responsive via Tailwind).
        For example,  h-64 on mobile, h-96 on medium screens, etc.
        This ensures the chart has space to fill. 
      */}
      <div className="flex-1 relative h-full">
        <Line data={chartData} options={lineChartOptions} />
      </div>
    </div>
  );
}
