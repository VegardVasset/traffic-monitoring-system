"use client";

import React from "react";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import TimeSeriesChart, { Event } from "@/components/shared/charts/timeSeriesChart/TimeSeriesChart";
import { UnifiedLegend } from "@/components/shared/UnifiedLegend";

export interface DrillDownSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  drillDownBinKey: string | null;
  getDrillDownBinSize: () => "hour" | "day" | "week" | "month";
  getDrillDownData: () => Event[];
  drillDownVehicleTypes: string[];
  startDate: string;
}

export default function DrillDownSheet({
  open,
  onOpenChange,
  drillDownBinKey,
  getDrillDownBinSize,
  getDrillDownData,
  drillDownVehicleTypes,
  startDate,
}: DrillDownSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="
          !max-w-none
          w-[85%]
          sm:w-[700px]
          md:w-[900px]
          lg:w-[1200px]
          text-xs
          h-screen
          flex
          flex-col
          overflow-hidden
          p-2
        "
      >
        <SheetHeader className="flex-none">
          <SheetTitle>Detailed View</SheetTitle>
        </SheetHeader>
        <div className="flex-1 flex flex-col mt-4">
          {drillDownBinKey ? (
            <>
              <p className="text-sm mb-2">
                Detailed breakdown for <b>{drillDownBinKey}</b> (bin size: {getDrillDownBinSize()})
              </p>
              <div className="flex-1 bg-white shadow rounded-lg p-2">
                <TimeSeriesChart
                  data={getDrillDownData()}
                  binSize={getDrillDownBinSize()}
                  startDate={startDate}
                  disableForecast={true}
                  applyDateFilter={false}
                />
              </div>
              <div className="mt-2 flex-none">
                <UnifiedLegend vehicleTypes={drillDownVehicleTypes} />
              </div>
            </>
          ) : (
            <p>No bin selected yet.</p>
          )}
        </div>
        <div className="flex-none">
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
