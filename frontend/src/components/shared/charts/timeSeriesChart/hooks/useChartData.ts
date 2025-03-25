// hooks/useChartData.ts
import { useMemo } from "react";
import { AggregatedDataEntry } from "../TimeSeriesChart";
import { getChartColor } from "@/lib/chartUtils";

type BinSize = "hour" | "day" | "week" | "month";

interface ChartData {
  labels: string[];
  datasets: any[];
}

export default function useChartData(
  aggregatedData: AggregatedDataEntry[],
  forecastEntry: AggregatedDataEntry | null,
  vehicleTypes: string[],
  isMobile: boolean,
  showForecast: boolean
): { chartData: ChartData } {
  const combinedLabels = useMemo(() => {
    const actualLabels = aggregatedData.map((entry) => entry.date);
    return showForecast && forecastEntry
      ? [...actualLabels, forecastEntry.date]
      : actualLabels;
  }, [aggregatedData, forecastEntry, showForecast]);

  const actualDatasets = useMemo(() => {
    return vehicleTypes.map((type, index) => ({
      label: type,
      data: aggregatedData.map((row) => Number(row[type]) || 0),
      borderColor: getChartColor(index),
      backgroundColor: getChartColor(index, 0.5),
      fill: false,
      borderWidth: isMobile ? 1 : 2,
      pointRadius: isMobile ? 4 : 5,
      pointHoverRadius: isMobile ? 5 : 6,
      spanGaps: true,
    }));
  }, [aggregatedData, vehicleTypes, isMobile]);

  const forecastFillDataset = useMemo(() => {
    if (!showForecast || !forecastEntry) return null;
    const lastIndex = aggregatedData.length - 1;
    const fillData = new Array(aggregatedData.length + 1).fill(null);
    let maxLast = 0;
    let maxForecast = 0;
    vehicleTypes.forEach((type) => {
      const vLast = Number(aggregatedData[lastIndex][type]) || 0;
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
    };
  }, [showForecast, forecastEntry, aggregatedData, vehicleTypes]);

  const forecastLineDatasets = useMemo(() => {
    if (!showForecast || !forecastEntry) return [];
    const lastIndex = aggregatedData.length - 1;
    return vehicleTypes.map((type, index) => {
      const lineData = new Array(aggregatedData.length + 1).fill(null);
      const lastVal = Number(aggregatedData[lastIndex][type]) || 0;
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
      };
    });
  }, [showForecast, forecastEntry, aggregatedData, vehicleTypes, isMobile]);

  const combinedDatasets = useMemo(() => {
    const ds = [];
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
