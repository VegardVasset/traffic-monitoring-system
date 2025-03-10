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

type BinnedCounts = Record<string, Record<string, number>>;

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

// ----------------------------------------------------------------
// 1. Helper functions to produce *sortable* bin keys (ISO) 
//    and also a *display label* for the chart axis.
// ----------------------------------------------------------------

// We keep all bin keys in a format that sorts properly (like YYYY-MM-DD or a pair).
// Then, we provide a separate function to format them as dd/mm/yy or a range.
function getHourBinKey(date: Date): string {
  // e.g. 2025-02-15T14
  // We'll keep only YYYY-MM-DDTHH for sorting
  return date.toISOString().substring(0, 13);
}
function getDayBinKey(date: Date): string {
  // e.g. 2025-02-15
  return date.toISOString().substring(0, 10);
}
function getWeekBinKey(date: Date): string {
  // This returns an ISO string for the *start* of the week, e.g. 2025-02-10
  // You can store startOfWeek only, or store start+end as a pair, as long as you keep it consistent
  const startOfWeek = new Date(date);
  startOfWeek.setHours(0, 0, 0, 0);
  let day = startOfWeek.getDay();
  if (day === 0) day = 7; // treat Sunday as day 7
  startOfWeek.setDate(startOfWeek.getDate() - (day - 1));
  // e.g. "2025-02-10"
  return startOfWeek.toISOString().substring(0, 10);
}

// Now a function that, given the bin key + binSize, returns a "display label."
function formatBinLabel(binKey: string, binSize: "hour" | "day" | "week"): string {
  // parse the ISO string(s) into real Dates
  if (binSize === "hour") {
    // binKey like "2025-02-15T14"
    const date = new Date(binKey + ":00:00Z"); // reconstruct full date string
    return formatHour(date);
  } else if (binSize === "day") {
    // binKey like "2025-02-15"
    const date = new Date(binKey);
    return formatDate(date);
  } else {
    // binSize === "week"
    // binKey like "2025-02-10" (start of the week)
    const startOfWeek = new Date(binKey);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    return `${formatDate(startOfWeek)} - ${formatDate(endOfWeek)}`;
  }
}

// Basic date formatting: dd/mm/yy
function formatDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear()).slice(-2);
  return `${day}/${month}/${year}`;
}

// Hourly label: dd/mm/yy HH:00
function formatHour(date: Date): string {
  const base = formatDate(date); // dd/mm/yy
  const hour = String(date.getHours()).padStart(2, "0");
  return `${base} ${hour}:00`;
}

// ----------------------------------------------------------------

export default function TimeSeriesChart({ data, binSize }: TimeSeriesChartProps) {
  const isMobile = useIsMobile();

  // 1) Derive vehicle types
  const vehicleTypes = useMemo(() => {
    const types = new Set<string>();
    data.forEach((e) => types.add(e.vehicleType));
    return Array.from(types);
  }, [data]);

  // 2) Create a function that returns an ISO "bin key" for each event date
  const getBinKey = useMemo(() => {
    switch (binSize) {
      case "hour":
        return getHourBinKey;
      case "day":
        return getDayBinKey;
      case "week":
        return getWeekBinKey;
      default:
        return getDayBinKey;
    }
  }, [binSize]);

  // 3) Aggregate data into an object keyed by the *sortable* binKey
  const binnedCounts: BinnedCounts = useMemo(() => {
    const counts: BinnedCounts = {};
    data.forEach((event) => {
      const eventDate = new Date(event.creationTime);
      const binKey = getBinKey(eventDate);

      if (!counts[binKey]) {
        counts[binKey] = {};
        // initialize counts for each vehicle type to 0
        vehicleTypes.forEach((type) => {
          counts[binKey][type] = 0;
        });
      }
      counts[binKey][event.vehicleType]++;
    });
    return counts;
  }, [data, vehicleTypes, getBinKey]);

  // 4) Sort bin keys by actual ISO date (string sort on "YYYY-MM-DD" or "YYYY-MM-DDTHH" is correct).
  const sortedBinKeys = useMemo(() => {
    return Object.keys(binnedCounts).sort(); 
    // With ISO strings, .sort() sorts chronologically.
  }, [binnedCounts]);

  // 5) Build final aggregated data array with a "display" label
  //    This is what you'll pass to Chart.js as the x-axis labels.
  const aggregatedData = useMemo(() => {
    return sortedBinKeys.map((binKey) => {
      return {
        // We'll store the display label in "date"
        date: formatBinLabel(binKey, binSize),
        ...binnedCounts[binKey],
      };
    });
  }, [sortedBinKeys, binnedCounts, binSize]);

  // 6) Build datasets for each vehicle type
  const datasets = useMemo(() => {
    return vehicleTypes.map((type, index) => ({
      label: type,
      data: aggregatedData.map((row) => (row[type] as number) || 0),
      borderColor: getChartColor(index),
      backgroundColor: getChartColor(index, 0.5),
      fill: false,
      borderWidth: isMobile ? 1 : 2,
      pointRadius: isMobile ? 1 : 2,
      pointHoverRadius: isMobile ? 3 : 4,
    }));
  }, [aggregatedData, vehicleTypes, isMobile]);


  // 7) Chart data
  const chartData = {
    labels: aggregatedData.map((entry) => entry.date),
    datasets,
  };

  // 8) Chart options
  const lineChartOptions: ChartOptions<"line"> = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          ticks: {
            font: {
              size: isMobile ? 10 : 12,
            },
            autoSkip: true,
            maxTicksLimit: isMobile ? 4 : 10,
          },
        },
        y: {
          ticks: {
            font: {
              size: isMobile ? 10 : 12,
            },
          },
        },
      },
      plugins: {
        legend: {
          display: false,
          position: "bottom",
          onClick: () => {}, // Disable legend clicks
          labels: {
            boxWidth: isMobile ? 6 : 12,
            font: {
              size: isMobile ? 6 : 14,
            },
          },
        },
        tooltip: {
          bodyFont: {
            size: isMobile ? 4 : 12,
          },
        },
        datalabels: {
          display: false,
        },
      },
    }),
    [isMobile, binSize]
  );

  return (
    <div className="flex flex-col w-full h-full">
      <h2 className="ml-4 text-xs md:text-xl font-semibold mb-4">
        Passings Over Time ({binSize})
      </h2>
      <div className="flex-1 relative h-full">
        <Line data={chartData} options={lineChartOptions} />
      </div>
    </div>
  );
}



