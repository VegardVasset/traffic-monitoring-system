"use client";

import { AggregatedDataEntry } from "./PassingsOverTimeChart"; 
import { formatTimeBin } from "@/lib/timeFormattingUtils";


export function getHourBinKey(date: Date): string {
  return date.toISOString().substring(0, 13);
}

export function getDayBinKey(date: Date): string {
  return date.toISOString().substring(0, 10);
}


export function getWeekBinKey(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  let dayOfWeek = d.getUTCDay();
  if (dayOfWeek === 0) {
    dayOfWeek = 7; 
  }

  d.setUTCDate(d.getUTCDate() + (4 - dayOfWeek));
  d.setUTCDate(d.getUTCDate() - 3);

  return d.toISOString().substring(0, 10);
}


export function getMonthBinKey(date: Date): string {
  return date.toISOString().substring(0, 7);
}

export function incrementDate(date: Date, binSize: "hour" | "day" | "week" | "month"): Date {
  const newDate = new Date(date);
  switch (binSize) {
    case "hour":
      newDate.setHours(newDate.getHours() + 1);
      break;
    case "day":
      newDate.setDate(newDate.getDate() + 1);
      break;
    case "week":
      newDate.setDate(newDate.getDate() + 7);
      break;
    case "month":
      newDate.setMonth(newDate.getMonth() + 1);
      break;
  }
  return newDate;
}

export function getNextBinKey(
  lastBinKey: string,
  binSize: "hour" | "day" | "week" | "month"
): string {
  let date: Date;
  if (binSize === "month") {
    const [year, month] = lastBinKey.split("-");
    date = new Date(Number(year), Number(month) - 1, 1);
  } else if (binSize === "week" || binSize === "day") {
    date = new Date(lastBinKey.substring(0, 10));
  } else if (binSize === "hour") {
    const dayString = lastBinKey.substring(0, 10);
    const hourString = lastBinKey.substring(11);
    date = new Date(`${dayString}T${hourString}:00:00Z`);
  } else {
    date = new Date(lastBinKey);
  }
  const nextDate = incrementDate(date, binSize);
  if (binSize === "hour") return nextDate.toISOString().substring(0, 13);
  if (binSize === "day" || binSize === "week") return nextDate.toISOString().substring(0, 10);
  if (binSize === "month") return nextDate.toISOString().substring(0, 7);
  return nextDate.toISOString();
}

export function isBinLikelyIncompleteForAveraging(
  binKey: string,
  binSize: "hour" | "day" | "week" | "month"
): boolean {
  const now = new Date();
  const binDate = parseBinKey(binKey, binSize);
  if (binSize === "month") {
    return (
      binDate.getFullYear() === now.getFullYear() &&
      binDate.getMonth() === now.getMonth()
    );
  }
  const binDay = binDate.toISOString().substring(0, 10);
  const nowDay = now.toISOString().substring(0, 10);
  return binDay === nowDay;
}

export function parseBinKey(binKey: string, binSize: "hour" | "day" | "week" | "month"): Date {
  if (binSize === "month") {
    const [year, month] = binKey.split("-");
    return new Date(Number(year), Number(month) - 1, 1);
  } else if (binSize === "week" || binSize === "day") {
    return new Date(binKey.substring(0, 10));
  } else if (binSize === "hour") {
    const dayString = binKey.substring(0, 10);
    const hourString = binKey.substring(11);
    return new Date(`${dayString}T${hourString}:00:00Z`);
  }
  return new Date(binKey);
}



// --- HOLT'S LINEAR TREND FORECAST ---
export function calculateHoltForecast(
  aggregatedData: AggregatedDataEntry[],
  binSize: "hour" | "day" | "week" | "month",
  vehicleTypes: string[],
  alpha = 0.5,
  beta = 0.5
): AggregatedDataEntry | null {
  const completeData = aggregatedData.filter((entry) =>
    !isBinLikelyIncompleteForAveraging(entry.binKey, binSize)
  );
  if (completeData.length < 2) return null;

  const forecast: Record<string, number> = {};
  vehicleTypes.forEach((type) => {
    const series = completeData.map((entry) => Number(entry[type]) || 0);
    let level = series[0];
    let trend = series.length > 1 ? series[1] - series[0] : 0;
    for (let t = 1; t < series.length; t++) {
      const value = series[t];
      const lastLevel = level;
      level = alpha * value + (1 - alpha) * (lastLevel + trend);
      trend = beta * (level - lastLevel) + (1 - beta) * trend;
    }
    forecast[type] = Math.max(0, Math.round(level + trend));
  });

  const lastCompleteBinKey = completeData[completeData.length - 1].binKey;
  let nextBinKey = getNextBinKey(lastCompleteBinKey, binSize);
  while (isBinLikelyIncompleteForAveraging(nextBinKey, binSize)) {
    nextBinKey = getNextBinKey(nextBinKey, binSize);
  }

  return {
    binKey: nextBinKey,
    date: formatTimeBin(nextBinKey, binSize),
    ...forecast,
  };
}
