import React from "react";
import { Button } from "@/components/ui/button";

interface TimeSeriesChartHeaderProps {
  binSize: string;
  disableForecast: boolean;
  aggregatedDataLength: number;
  showForecast: boolean;
  onToggleForecast: () => void;
}

export default function TimeSeriesChartHeader({
  binSize,
  disableForecast,
  aggregatedDataLength,
  showForecast,
  onToggleForecast,
}: TimeSeriesChartHeaderProps) {
  return (
    <div className="flex items-center justify-between px-2">
      <h2 className="text-xs md:text-xl font-semibold mb-4">
        Passings Over Time ({binSize})
      </h2>
      {binSize !== "hour" && !disableForecast && (
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleForecast}
          disabled={aggregatedDataLength < 2}
        >
          {showForecast ? "Hide Forecast" : "Show Forecast"}
        </Button>
      )}
    </div>
  );
}
