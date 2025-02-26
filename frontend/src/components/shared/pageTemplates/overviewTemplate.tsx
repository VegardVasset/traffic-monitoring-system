"use client";

import React, { useCallback, useMemo, useState } from "react";
import FilterPanel from "@/components/shared/filterPanel";
import PeriodFilter from "@/components/shared/periodFilter";
import EventSummary from "@/components/shared/eventSummary";
import TimeSeriesChart from "@/components/shared/charts/timeSeriesChart";
import VehicleDistributionChart from "@/components/shared/charts/vehicleDistributionChart";

// ShadCN UI components:
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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

export interface BaseEvent {
  id: number;
  creationTime: string;
  receptionTime: string;
  vehicleType: string;
  camera: string;
}

interface OverviewTemplateProps {
  domainTitle: string;
  defaultBinSize?: "hour" | "day" | "week";
  /** Adding the children prop so TS recognizes it. */
  children?: React.ReactNode;
}

export default function OverviewTemplate({
  domainTitle,
  defaultBinSize = "day",
  children,
}: OverviewTemplateProps) {
  // Use the centralized data from DataContext.
  const { data, loading, isLive, setIsLive } = useData();

  // Local UI state for filters and bin size.
  const [selectedCamera, setSelectedCamera] = useState<string>("all");
  const [selectedVehicleTypes, setSelectedVehicleTypes] = useState<string[]>([]);
  const [binSize, setBinSize] = useState<"hour" | "day" | "week">(defaultBinSize);

  // Date range: from 1 month ago to today.
  const today = new Date().toISOString().substring(0, 10);
  const oneMonthAgo = new Date(new Date().setMonth(new Date().getMonth() - 1))
    .toISOString()
    .substring(0, 10);
  const [startDate, setStartDate] = useState<string>(oneMonthAgo);
  const [endDate, setEndDate] = useState<string>(today);

  const handlePeriodChange = useCallback((start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
  }, []);

  // Derive unique vehicle types and cameras from the provided data.
  const derivedVehicleTypes = useMemo(() => {
    const types = new Set<string>();
    data.forEach((event) => types.add(event.vehicleType));
    return Array.from(types);
  }, [data]);

  const derivedCameras = useMemo(() => {
    const cams = new Map<string, string>();
    data.forEach((event) => {
      cams.set(event.camera, event.camera);
    });
    return Array.from(cams, ([id, name]) => ({ id, name }));
  }, [data]);

  // Apply filtering based on date range, selected camera, and vehicle types.
  const filteredData = useMemo(() => {
    return data.filter((event) => {
      const eventDate = event.creationTime.substring(0, 10);
      const withinDateRange = eventDate >= startDate && eventDate <= endDate;
      const matchCamera = selectedCamera === "all" || event.camera === selectedCamera;
      const matchVehicle =
        selectedVehicleTypes.length === 0 ||
        selectedVehicleTypes.includes(event.vehicleType);

      return withinDateRange && matchCamera && matchVehicle;
    });
  }, [data, selectedCamera, selectedVehicleTypes, startDate, endDate]);

  // Mobile filter drawer state.
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  if (loading && !isLive) {
    return <p className="text-gray-500">Loading {domainTitle} data...</p>;
  }

  return (
    <div className="px-2 md:px-6 py-4 md:py-6 w-full">
      <h1 className="text-2xl md:text-3xl font-bold mb-4">{domainTitle} Overview</h1>

      {/* ===================== Desktop Filters ===================== */}
      <div className="hidden md:block">
        <div className="flex flex-col md:flex-row gap-6 mb-6">
          {/* Date Range Card */}
          <Card className="w-full md:max-w-md">
            <CardHeader>
              <CardTitle>Date Range</CardTitle>
            </CardHeader>
            <CardContent>
              <PeriodFilter
                startDate={startDate}
                endDate={endDate}
                onChange={handlePeriodChange}
              />
            </CardContent>
          </Card>

          {/* Event Summary Card */}
          <Card className="w-full md:max-w-md">
            <CardHeader>
              <CardTitle>Passings for chosen period</CardTitle>
            </CardHeader>
            <CardContent>
              <EventSummary count={filteredData.length} />
            </CardContent>
          </Card>
        </div>

        {/* Filter Panel */}
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
        />
      </div>

      {/* ===================== Mobile Drawer Trigger ===================== */}
      <div className="block md:hidden mb-4">
        <Button variant="outline" onClick={() => setMobileFilterOpen(true)}>
          Open Filters
        </Button>
      </div>

      {/* ===================== Mobile Drawer Content ===================== */}
      <Sheet open={mobileFilterOpen} onOpenChange={setMobileFilterOpen}>
        <SheetContent side="right" className="w-[85%] sm:w-[400px]">
          <SheetHeader>
            <SheetTitle>{domainTitle} Filters</SheetTitle>
          </SheetHeader>

          <div className="mt-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Date Range</CardTitle>
              </CardHeader>
              <CardContent>
                <PeriodFilter
                  startDate={startDate}
                  endDate={endDate}
                  onChange={handlePeriodChange}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Passings for chosen period</CardTitle>
              </CardHeader>
              <CardContent>
                <EventSummary count={filteredData.length} />
              </CardContent>
            </Card>

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
            />
          </div>

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

      {/* ===================== Charts ===================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
        <div className="bg-white shadow rounded-lg p-4 overflow-hidden min-h-[500px] md:min-h-[600px] xl:min-h-[700px]">
          <TimeSeriesChart data={filteredData} binSize={binSize} />
        </div>
        <div className="bg-white shadow rounded-lg p-4 overflow-hidden min-h-[300px] md:min-h-[400px] xl:min-h-[700px]">
          <VehicleDistributionChart data={filteredData} />
        </div>
      </div>

      {/* Render children (e.g., TireConditionChart) if provided */}
      {children && <div className="mt-6">{children}</div>}
    </div>
  );
}
