"use client";

import React, { useCallback, useMemo, useState, useEffect } from "react";
import FilterPanel from "@/components/shared/FilterPanel";
import PeriodFilter from "@/components/shared/PeriodFilter";
import EventSummary from "@/components/shared/EventCount";
import { MOBILE_MAX_WIDTH } from "@/config/config";
import TimeSeriesChart from "@/components/shared/charts/timeSeriesChart/TimeSeriesChart";
import VehicleDistributionChart from "@/components/shared/charts/VehicleDistributionChart";
import { UnifiedLegend } from "@/components/shared/UnifiedLegend";
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

// Domain-specific titles can be defined here
const OVERVIEW_TITLES: Record<string, string> = {
  dts: "DTS Scanner",
  vpc: "VPC",
  tires: "Tire Scanner",
};

export interface OverviewTemplateProps {
  domain: string;
  defaultBinSize?: "hour" | "day" | "week" | "month";
  children?: React.ReactNode;
}

export default function OverviewTemplate({
  domain,
  defaultBinSize = "day",
  children,
}: OverviewTemplateProps) {
  // Compute the title from the domain
  const domainTitle = OVERVIEW_TITLES[domain] || "Overview";

  // Data from context
  const { data, loading, isLive, setIsLive, refetch } = useData();

  // Local states and derived values remain unchanged…
  const [selectedCamera, setSelectedCamera] = useState<string>("all");
  const [selectedVehicleTypes, setSelectedVehicleTypes] = useState<string[]>(
    []
  );
  const [binSize, setBinSize] = useState<"hour" | "day" | "week" | "month">(
    defaultBinSize
  );

  const today = new Date().toISOString().substring(0, 10);
  const oneWeekAgo = new Date(new Date().setDate(new Date().getDate() - 7))
    .toISOString()
    .substring(0, 10);

  const [startDate, setStartDate] = useState<string>(oneWeekAgo);
  const [endDate, setEndDate] = useState<string>(today);

  // Derived data (filtered data, derived cameras/vehicle types, etc.)
  const derivedVehicleTypes = useMemo(() => {
    const types = new Set<string>();
    data.forEach((event) => types.add(event.vehicleType));
    return Array.from(types);
  }, [data]);

  const derivedCameras = useMemo(() => {
    const cams = new Map<string, string>();
    data.forEach((event) => cams.set(event.camera, event.camera));
    return Array.from(cams, ([id, name]) => ({ id, name }));
  }, [data]);

  const filteredData = useMemo(() => {
    return data.filter((event) => {
      const eventDate = event.creationTime.substring(0, 10);
      const withinDateRange = eventDate >= startDate && eventDate <= endDate;
      const matchCamera =
        selectedCamera === "all" || event.camera === selectedCamera;
      const matchVehicle =
        selectedVehicleTypes.length === 0 ||
        selectedVehicleTypes.includes(event.vehicleType);
      return withinDateRange && matchCamera && matchVehicle;
    });
  }, [data, selectedCamera, selectedVehicleTypes, startDate, endDate]);

  const filteredVehicleTypes = useMemo(() => {
    const types = new Set<string>();
    filteredData.forEach((event) => types.add(event.vehicleType));
    return Array.from(types);
  }, [filteredData]);

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
      return filteredData.filter(
        (evt) => evt.creationTime.substring(0, 10) === dayString
      );
    } else if (binSize === "week") {
      const startOfWeek = new Date(drillDownBinKey);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 6);
      return filteredData.filter((evt) => {
        const evtDate = new Date(evt.creationTime.substring(0, 10));
        return evtDate >= startOfWeek && evtDate <= endOfWeek;
      });
    } else if (binSize === "month") {
      return filteredData.filter((evt) =>
        evt.creationTime.startsWith(drillDownBinKey)
      );
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

  return (
    <div className="px-2 md:px-4 py-2 md:py-4 w-full">
      {isLoading ? (
        <p className="text-gray-500">Loading {domainTitle} data...</p>
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4">
              Overview
            </h1>
            <div className="block lg:hidden">
              <Button
                variant="outline"
                onClick={() => setMobileFilterOpen(true)}
              >
                Open Filters
              </Button>
            </div>
          </div>

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

          <Sheet open={mobileFilterOpen} onOpenChange={setMobileFilterOpen}>
            <SheetContent
              side="right"
              className="w-[85%] sm:w-[360px] p-2 text-xs"
            >
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

          <UnifiedLegend vehicleTypes={filteredVehicleTypes} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-2">
            <div
              className="relative w-full"
              style={{ aspectRatio: isMobile ? "1 / 1" : "1.5 / 1" }}
            >
              <div className="absolute inset-0 bg-white shadow rounded-lg p-2">
                <TimeSeriesChart
                  data={filteredData}
                  binSize={binSize}
                  onDataPointClick={handleDataPointClick}
                />
              </div>
            </div>
            <div
              className="relative w-full"
              style={{ aspectRatio: isMobile ? "1 / 1" : "1.5 / 1" }}
            >
              <div className="absolute inset-0 bg-white shadow rounded-lg p-2">
                <VehicleDistributionChart data={filteredData} />
              </div>
            </div>
          </div>

          {children && <div className="mt-4">{children}</div>}

          <Sheet open={drillDownOpen} onOpenChange={setDrillDownOpen}>
            <SheetContent
              side="right"
              className="
      !max-w-none
      w-[85%]            /* Overlay width on small screens */
      sm:w-[700px]       /* Then 700px on sm+ */
      md:w-[900px]       /* 900px on md+ */
      lg:w-[1200px]      /* 1200px on lg+ */
      text-xs
      h-screen           /* Full screen height */
      flex
      flex-col
      overflow-hidden    /* No scrolling: everything must fit */
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
                      Detailed breakdown for <b>{drillDownBinKey}</b> (bin size:{" "}
                      {getDrillDownBinSize()})
                    </p>
                    <div className="flex-1 bg-white shadow rounded-lg p-2">
                      <TimeSeriesChart
                        data={getDrillDownData()}
                        binSize={getDrillDownBinSize()}
                        disableForecast={true}
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
