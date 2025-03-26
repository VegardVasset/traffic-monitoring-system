"use client";

import { useMemo } from "react";
import { Event, AggregatedDataEntry } from "../TimeSeriesChart";
import {
  getHourBinKey,
  getDayBinKey,
  getWeekBinKey,
  getMonthBinKey
} from "../utils";
import { formatTimeBin } from "@/lib/timeFormattingUtils";

type BinSize = "hour" | "day" | "week" | "month";

/**
 * Bins your raw events by the chosen binSize and returns an array of AggregatedDataEntry.
 */
export default function useAggregatedData(data: Event[], binSize: BinSize) {
  const vehicleTypes = useMemo(() => {
    const types = new Set<string>();
    data.forEach((e) => types.add(e.vehicleType));
    return Array.from(types);
  }, [data]);

  const getBinKey = useMemo(() => {
    switch (binSize) {
      case "hour":
        return getHourBinKey;
      case "day":
        return getDayBinKey;
      case "week":
        return getWeekBinKey; // <-- ISO aggregator
      case "month":
        return getMonthBinKey;
      default:
        return getDayBinKey;
    }
  }, [binSize]);

  const binnedCounts = useMemo(() => {
    const counts: Record<string, Record<string, number>> = {};
    data.forEach((event) => {
      const eventDate = new Date(event.creationTime);
      const binKey = getBinKey(eventDate);
      if (!counts[binKey]) {
        counts[binKey] = {};
        vehicleTypes.forEach((type) => {
          counts[binKey][type] = 0;
        });
      }
      counts[binKey][event.vehicleType] =
        (counts[binKey][event.vehicleType] || 0) + 1;
    });
    return counts;
  }, [data, vehicleTypes, getBinKey]);

  // Sort the bin keys
  const sortedBinKeys = useMemo(
    () => Object.keys(binnedCounts).sort(),
    [binnedCounts]
  );

  // Convert to AggregatedDataEntry array
  const aggregatedData: AggregatedDataEntry[] = useMemo(() => {
    return sortedBinKeys.map((binKey) => ({
      binKey,
      date: formatTimeBin(binKey, binSize), // e.g. "Week 1, 2025"
      ...binnedCounts[binKey],
    }));
  }, [sortedBinKeys, binnedCounts, binSize]);

  return { aggregatedData, vehicleTypes };
}
