"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import PeriodFilter from "@/components/shared/PeriodFilter";
import EventSummary from "@/components/shared/EventCount";
import FilterPanel from "@/components/shared/FilterPanel";

export interface MobileFiltersSheetProps {
  domainTitle: string;
  mobileFilterOpen: boolean;
  setMobileFilterOpen: (open: boolean) => void;
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

export default function MobileFiltersSheet({
  domainTitle,
  mobileFilterOpen,
  setMobileFilterOpen,
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
}: MobileFiltersSheetProps) {
  return (
    <Sheet open={mobileFilterOpen} onOpenChange={setMobileFilterOpen}>
      <SheetContent side="right" className="w-[85%] sm:w-[360px] p-2 text-xs">
        <SheetHeader>
          <SheetTitle>{domainTitle} Filters</SheetTitle>
        </SheetHeader>
        <Card className="p-4 mt-4">
          <div className="flex flex-col gap-4 w-full">
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
            <PeriodFilter
              startDate={startDate}
              endDate={endDate}
              onChange={(start, end) => {
                setStartDate(start);
                setEndDate(end);
              }}
            />
            <EventSummary count={filteredDataCount} />
          </div>
        </Card>
        <div className="mt-4">
          <SheetClose asChild>
            <Button variant="outline">Close</Button>
          </SheetClose>
        </div>
      </SheetContent>
      <SheetTrigger asChild>
        <div />
      </SheetTrigger>
    </Sheet>
  );
}