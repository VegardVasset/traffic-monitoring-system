"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import PeriodFilter from "@/components/shared/PeriodFilter";
import EventSummary from "@/components/shared/EventCount";
import FilterPanel from "@/components/shared/FilterPanel";

export interface DesktopFiltersProps {
  startDate: string;
  endDate: string;
  setStartDate: (date: string) => void;
  setEndDate: (date: string) => void;
  filteredDataCount: number;
  derivedCameras: { id: string; name: string }[];
  selectedCamera: string;
  setSelectedCamera: (id: string) => void;
  derivedVehicleTypes: string[];
  selectedVehicleTypes: string[];
  setSelectedVehicleTypes: (types: string[]) => void;
  binSize: "hour" | "day" | "week" | "month";
  setBinSize: (size: "hour" | "day" | "week" | "month") => void;
  isLive: boolean;
  setIsLive: (live: boolean) => void;
  onRefetch?: () => void;      
  showBinSize?: boolean;       
}

export default function DesktopFilters({
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  filteredDataCount,
  derivedCameras,
  selectedCamera,
  setSelectedCamera,
  derivedVehicleTypes,
  selectedVehicleTypes,
  setSelectedVehicleTypes,
  binSize,
  setBinSize,
  isLive,
  setIsLive,
  onRefetch,
  showBinSize,
}: DesktopFiltersProps) {
  return (
    <div className="flex flex-wrap items-start gap-4 mb-4">
      <Card className="p-3 max-w-sm w-full hidden lg:block">
        <PeriodFilter
          startDate={startDate}
          endDate={endDate}
          onChange={(start, end) => {
            setStartDate(start);
            setEndDate(end);
          }}
        />
      </Card>
      <Card className="p-3 max-w-sm w-full hidden lg:block">
        <EventSummary count={filteredDataCount} />
      </Card>
      <Card className="p-3 hidden lg:block">
        <FilterPanel
          cameras={derivedCameras}
          selectedCamera={selectedCamera}
          setSelectedCamera={setSelectedCamera}
          vehicleTypes={derivedVehicleTypes}
          selectedVehicleTypes={selectedVehicleTypes}
          setSelectedVehicleTypes={setSelectedVehicleTypes}
          binSize={binSize}
          setBinSize={setBinSize}
          isLive={isLive}
          setIsLive={setIsLive}
          onRefetch={onRefetch}
          showBinSize={showBinSize}
          showLiveButton={false}
        />
      </Card>
    </div>
  );
}