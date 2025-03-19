"use client";

import React, { useCallback, useMemo, useState, useEffect } from "react";
import FilterPanel from "@/components/shared/filterPanel";
import PeriodFilter from "@/components/shared/periodFilter";
import EventSummary from "@/components/shared/eventCount";
import { MOBILE_MAX_WIDTH } from "@/config/config";
import TimeSeriesChart from "@/components/shared/charts/timeSeriesChart";
import VehicleDistributionChart from "@/components/shared/charts/vehicleDistributionChart";
import { UnifiedLegend } from "@/components/shared/unifiedLegend";
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
import { useData } from "@/context/DataContext";

// --------------------------------
// Types & Interfaces
// --------------------------------
export interface BaseEvent {
  id: number;
  creationTime: string;
  receptionTime: string;
  vehicleType: string;
  camera: string;
}

/** Helper: convert ISO date (yyyy-mm-dd) to dd-mm-yyyy */
function formatIsoDate(iso: string): string {
  const [year, month, day] = iso.split("-");
  return `${day}-${month}-${year}`;
}

/** Helper: compute ISO week number for a given date */
function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

/**
 * formatDrillDownLabel
 * Converts the clicked binKey + binSize to a user-friendly label.
 */
function formatDrillDownLabel(
  binKey: string,
  currentBinSize: "hour" | "day" | "week" | "month"
): string {
  if (currentBinSize === "hour") {
    return formatIsoDate(binKey.substring(0, 10)) + " " + binKey.substring(11) + ":00";
  } else if (currentBinSize === "day") {
    return formatIsoDate(binKey);
  } else if (currentBinSize === "week") {
    const date = new Date(binKey);
    const weekNo = getWeekNumber(date);
    const year = date.getFullYear();
    return `Week ${weekNo}-${year}`;
  } else if (currentBinSize === "month") {
    const [year, month] = binKey.split("-");
    return `${month}-${year}`;
  }
  return binKey;
}

interface OverviewTemplateProps {
  domainTitle: string;
  defaultBinSize?: "hour" | "day" | "week" | "month";
  children?: React.ReactNode;
}

// --------------------------------
// Main Component
// --------------------------------
export default function OverviewTemplate({
  domainTitle,
  defaultBinSize = "day",
  children,
}: OverviewTemplateProps) {
  // Data from context
  const { data, loading, isLive, setIsLive, refetch } = useData();

  // Local states
  const [selectedCamera, setSelectedCamera] = useState<string>("all");
  const [selectedVehicleTypes, setSelectedVehicleTypes] = useState<string[]>([]);
  const [binSize, setBinSize] = useState<"hour" | "day" | "week" | "month">(defaultBinSize);

  // Default date range: 1 week ago until today (ISO format)
  const today = new Date().toISOString().substring(0, 10);
  const oneWeekAgo = new Date(new Date().setDate(new Date().getDate() - 7))
    .toISOString()
    .substring(0, 10);

  const [startDate, setStartDate] = useState<string>(oneWeekAgo);
  const [endDate, setEndDate] = useState<string>(today);

  // --------------------------------
  // Derived Data
  // --------------------------------

  // 1) Collect vehicle types for filter panel.
  const derivedVehicleTypes = useMemo(() => {
    const types = new Set<string>();
    data.forEach((event) => types.add(event.vehicleType));
    return Array.from(types);
  }, [data]);

  // 2) Collect cameras for filter panel.
  const derivedCameras = useMemo(() => {
    const cams = new Map<string, string>();
    data.forEach((event) => cams.set(event.camera, event.camera));
    return Array.from(cams, ([id, name]) => ({ id, name }));
  }, [data]);

  // 3) Filter data based on camera, vehicle types, and date range.
  const filteredData = useMemo(() => {
    return data.filter((event) => {
      const eventDate = event.creationTime.substring(0, 10);
      const withinDateRange = eventDate >= startDate && eventDate <= endDate;
      const matchCamera = selectedCamera === "all" || event.camera === selectedCamera;
      const matchVehicle =
        selectedVehicleTypes.length === 0 || selectedVehicleTypes.includes(event.vehicleType);
      return withinDateRange && matchCamera && matchVehicle;
    });
  }, [data, selectedCamera, selectedVehicleTypes, startDate, endDate]);

  // 4) For the main chart’s legend, show only vehicle types in filteredData.
  const filteredVehicleTypes = useMemo(() => {
    const types = new Set<string>();
    filteredData.forEach((event) => types.add(event.vehicleType));
    return Array.from(types);
  }, [filteredData]);

  // --------------------------------
  // Responsiveness
  // --------------------------------
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < MOBILE_MAX_WIDTH);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // --------------------------------
  // Drill-Down Logic
  // --------------------------------
  const [drillDownOpen, setDrillDownOpen] = useState(false);
  const [drillDownBinKey, setDrillDownBinKey] = useState<string | null>(null);

  const handleDataPointClick = useCallback((binKey: string) => {
    setDrillDownBinKey(binKey);
    setDrillDownOpen(true);
  }, []);

  const getDrillDownBinSize = useCallback(() => {
    if (binSize === "day") return "hour";
    if (binSize === "week") return "day";
    if (binSize === "month") return "week";
    return "hour";
  }, [binSize]);

  const getDrillDownData = useCallback(() => {
    if (!drillDownBinKey) return [];
    if (binSize === "day") {
      const dayString = drillDownBinKey.substring(0, 10);
      return filteredData.filter((evt) => evt.creationTime.substring(0, 10) === dayString);
    } else if (binSize === "week") {
      const startOfWeek = new Date(drillDownBinKey);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 6);
      return filteredData.filter((evt) => {
        const evtDate = new Date(evt.creationTime.substring(0, 10));
        return evtDate >= startOfWeek && evtDate <= endOfWeek;
      });
    } else if (binSize === "month") {
      return filteredData.filter((evt) => evt.creationTime.startsWith(drillDownBinKey));
    }
    return [];
  }, [binSize, drillDownBinKey, filteredData]);

  const drillDownData = getDrillDownData();

  const drillDownVehicleTypes = useMemo(() => {
    const types = new Set<string>();
    drillDownData.forEach((evt) => types.add(evt.vehicleType));
    return Array.from(types);
  }, [drillDownData]);

  const isLoading = loading && !isLive;

  // --------------------------------
  // Render
  // --------------------------------
  return (
    <div className="px-2 md:px-4 py-2 md:py-4 w-full">
      {isLoading ? (
        <p className="text-gray-500">Loading {domainTitle} data...</p>
      ) : (
        <>
          {/* TOP HEADER & MOBILE FILTER BUTTON */}
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4">
              {domainTitle} Overview
            </h1>
            <div className="block lg:hidden">
              <Button variant="outline" onClick={() => setMobileFilterOpen(true)}>
                Open Filters
              </Button>
            </div>
          </div>

          {/* PERIOD, EVENT SUMMARY, FILTER PANEL ROW */}
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
              <EventSummary count={filteredData.length} />
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
                showLiveButton={false}
                onRefetch={refetch}
              />
            </Card>
          </div>

          {/* MOBILE FILTER SHEET */}
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
                    showLiveButton={false}
                    onRefetch={refetch}
                  />
                  <PeriodFilter
                    startDate={startDate}
                    endDate={endDate}
                    onChange={(start, end) => {
                      setStartDate(start);
                      setEndDate(end);
                    }}
                  />
                  <EventSummary count={filteredData.length} />
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

          {/* MAIN LEGEND */}
          <UnifiedLegend vehicleTypes={filteredVehicleTypes} />

          {/* MAIN CHARTS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-2">
            <div className="relative w-full" style={{ aspectRatio: isMobile ? "1 / 1" : "1.5 / 1" }}>
              <div className="absolute inset-0 bg-white shadow rounded-lg p-2">
                <TimeSeriesChart
                  data={filteredData}
                  binSize={binSize}
                  onDataPointClick={handleDataPointClick}
                />
              </div>
            </div>
            <div className="relative w-full" style={{ aspectRatio: isMobile ? "1 / 1" : "1.5 / 1" }}>
              <div className="absolute inset-0 bg-white shadow rounded-lg p-2">
                <VehicleDistributionChart data={filteredData} />
              </div>
            </div>
          </div>

          {children && <div className="mt-4">{children}</div>}

          {/* DRILL-DOWN SHEET / MODAL */}
          <Sheet open={drillDownOpen} onOpenChange={setDrillDownOpen}>
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
                      Detailed breakdown for <b>{formatDrillDownLabel(drillDownBinKey, binSize)}</b>
                      <br />
                      (Drill-down bin size: {getDrillDownBinSize()})
                    </p>
                    <div className="flex-1 bg-white shadow rounded-lg p-2">
                      <TimeSeriesChart
                        data={getDrillDownData()}
                        binSize={getDrillDownBinSize()}
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
        </>
      )}
    </div>
  );
}
