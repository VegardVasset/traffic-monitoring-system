"use client";

import { useMemo } from "react";
import { AggregatedDataEntry } from "../TimeSeriesChart";
import { getChartColor } from "@/lib/chartUtils";
import { ChartDataset } from "chart.js";

interface ChartData {
  labels: string[];
  datasets: ChartDataset<"line">[];
}

export default function useChartData(
  aggregatedData: AggregatedDataEntry[],
  forecastEntry: AggregatedDataEntry | null,
  vehicleTypes: string[],
  isMobile: boolean,
  showForecast: boolean,
  startDate: string
): { chartData: ChartData } {
  // We'll just rename aggregatedData -> filteredAggregatedData if you want:
  const filteredAggregatedData = aggregatedData;

  const combinedLabels = useMemo(() => {
    const actualLabels = filteredAggregatedData.map((entry) => entry.date);
    return showForecast && forecastEntry
      ? [...actualLabels, forecastEntry.date]
      : actualLabels;
  }, [filteredAggregatedData, forecastEntry, showForecast]);

  const actualDatasets = useMemo(() => {
    return vehicleTypes.map((type, index) => ({
      label: type,
      data: filteredAggregatedData.map((row) => Number(row[type]) || 0),
      borderColor: getChartColor(index),
      backgroundColor: getChartColor(index, 0.5),
      fill: false,
      borderWidth: isMobile ? 1 : 2,
      pointRadius: isMobile ? 4 : 5,
      pointHoverRadius: isMobile ? 5 : 6,
      spanGaps: true,
    })) as ChartDataset<"line">[];
  }, [filteredAggregatedData, vehicleTypes, isMobile]);

  // If you have forecast logic, keep it here. Otherwise, remove
  const forecastFillDataset = useMemo(() => {
    if (!showForecast || !forecastEntry) return null;
    const lastIndex = filteredAggregatedData.length - 1;
    const fillData = new Array(filteredAggregatedData.length + 1).fill(null);
    let maxLast = 0;
    let maxForecast = 0;
    vehicleTypes.forEach((type) => {
      const vLast = Number(filteredAggregatedData[lastIndex][type]) || 0;
      const vFcast = Number(forecastEntry[type]) || 0;
      maxLast = Math.max(maxLast, vLast);
      maxForecast = Math.max(maxForecast, vFcast);
    });
    const biggerVal = Math.max(maxLast, maxForecast);
    fillData[lastIndex] = 0;
    fillData[lastIndex + 1] = biggerVal;
    const gradientFill = "rgba(150, 200, 255, 0.4)";
    return {
      label: "Forecast Fill",
      data: fillData,
      backgroundColor: gradientFill,
      borderColor: "transparent",
      fill: true,
      tension: 0,
      pointRadius: 0,
      borderWidth: 0,
      spanGaps: true,
      order: 1,
    } as ChartDataset<"line">;
  }, [showForecast, forecastEntry, filteredAggregatedData, vehicleTypes]);

  const forecastLineDatasets = useMemo(() => {
    if (!showForecast || !forecastEntry) return [] as ChartDataset<"line">[];
    const lastIndex = filteredAggregatedData.length - 1;
    return vehicleTypes.map((type, index) => {
      const lineData = new Array(filteredAggregatedData.length + 1).fill(null);
      const lastVal = Number(filteredAggregatedData[lastIndex][type]) || 0;
      const fVal = Number(forecastEntry[type]) || 0;
      lineData[lastIndex] = lastVal;
      lineData[lastIndex + 1] = fVal;
      return {
        label: `${type} (Forecast)`,
        data: lineData,
        borderColor: getChartColor(index),
        backgroundColor: getChartColor(index, 0.5),
        fill: false,
        borderDash: [5, 5],
        borderWidth: isMobile ? 1 : 2,
        pointRadius: isMobile ? 4 : 5,
        pointHoverRadius: isMobile ? 5 : 6,
        spanGaps: true,
        order: 2,
      } as ChartDataset<"line">;
    });
  }, [showForecast, forecastEntry, filteredAggregatedData, vehicleTypes, isMobile]);

  const combinedDatasets = useMemo(() => {
    const ds: ChartDataset<"line">[] = [];
    if (forecastFillDataset) ds.push(forecastFillDataset);
    ds.push(...actualDatasets);
    ds.push(...forecastLineDatasets);
    return ds;
  }, [forecastFillDataset, actualDatasets, forecastLineDatasets]);

  const chartData = useMemo(
    () => ({
      labels: combinedLabels,
      datasets: combinedDatasets,
    }),
    [combinedLabels, combinedDatasets]
  );

  return { chartData };
}
