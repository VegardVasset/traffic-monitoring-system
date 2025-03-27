import { useMemo } from "react";
import { AggregatedDataEntry } from "../TimeSeriesChart";
import { calculateHoltForecast } from "../utils";

type BinSize = "hour" | "day" | "week" | "month";

export default function useForecastEntry(
  aggregatedData: AggregatedDataEntry[],
  binSize: BinSize,
  vehicleTypes: string[],
  disableForecast: boolean
) {
  return useMemo(() => {
    if (disableForecast) return null;
    return calculateHoltForecast(aggregatedData, binSize, vehicleTypes, 0.5, 0.5);
  }, [aggregatedData, binSize, vehicleTypes, disableForecast]);
}
