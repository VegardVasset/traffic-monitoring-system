"use client";

import React, { useCallback, useMemo, useState } from "react";
import FilterPanel from "@/components/shared/filterPanel";
import PeriodFilter from "@/components/shared/periodFilter";
import EventSummary from "@/components/shared/eventSummary";
import TimeSeriesChart from "@/components/shared/charts/timeSeriesChart";
import VehicleDistributionChart from "@/components/shared/charts/vehicleDistributionChart";

// ShadCN UI components
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
  children?: React.ReactNode;
}

export default function OverviewTemplate({
  domainTitle,
  defaultBinSize = "day",
  children,
}: OverviewTemplateProps) {
  // Data from context
  const { data, loading, isLive, setIsLive } = useData();

  // Local state for filters
  const [selectedCamera, setSelectedCamera] = useState<string>("all");
  const [selectedVehicleTypes, setSelectedVehicleTypes] = useState<string[]>(
    []
  );
  const [binSize, setBinSize] = useState<"hour" | "day" | "week">(
    defaultBinSize
  );

  // Default date range: 1 month ago until today
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

  // Derive unique vehicle types and cameras
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

  // Filter the data
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

  // Mobile drawer state
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  if (loading && !isLive) {
    return <p className="text-gray-500">Loading {domainTitle} data...</p>;
  }

  return (
    <div className="px-2 md:px-4 py-2 md:py-4 w-full">
      {/* Page Title */}
      <h1 className="text-base md:text-2xl font-bold mb-2">
        {domainTitle} Overview
      </h1>

      {/* ================== DESKTOP LAYOUT (lg+) ================== */}
      <div className="hidden lg:block mb-4">
        <Card className="p-4">
          {/* 
            On lg+ screens: flex row, gap-4, left-aligned, no forced widths
            On smaller screens (if forced to appear?), they'd stack
          */}
          <div className="flex flex-col lg:flex-row gap-4 items-start justify-start">
            {/* Filters */}
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

            {/* Period Filter */}
            <div className="self-end">
              <PeriodFilter
                startDate={startDate}
                endDate={endDate}
                onChange={handlePeriodChange}
              />
            </div>

            {/* Summary */}
            <div className="ml-auto self-end">
              <EventSummary count={filteredData.length} />
            </div>
          
        
          </div>
        </Card>
      </div>

      {/* ================== MOBILE LAYOUT (drawer) ================== */}
      <div className="block lg:hidden mb-4">
        <Button variant="outline" onClick={() => setMobileFilterOpen(true)}>
          Open Filters
        </Button>
      </div>

      <Sheet open={mobileFilterOpen} onOpenChange={setMobileFilterOpen}>
        <SheetContent side="right" className="w-[85%] sm:w-[360px] p-2 text-xs">
          <SheetHeader>
            <SheetTitle>{domainTitle} Filters</SheetTitle>
          </SheetHeader>

          {/* Single Card that stacks everything vertically on mobile */}
          <Card className="p-4 mt-4">
            <div className="flex flex-col gap-4 w-full">
              {/* FilterPanel */}
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

              {/* PeriodFilter */}
              <PeriodFilter
                startDate={startDate}
                endDate={endDate}
                onChange={handlePeriodChange}
              />

              {/* EventSummary */}
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

      {/* ================== CHARTS ================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-2">
        <div className="bg-white shadow rounded-lg p-2 overflow-hidden h-auto md:min-h-[400px] xl:min-h-[580px]">
          <TimeSeriesChart data={filteredData} binSize={binSize} />
        </div>
        <div className="bg-white shadow rounded-lg p-2 overflow-hidden h-auto md:min-h-[400px] xl:min-h-[580px]">
          <VehicleDistributionChart data={filteredData} />
        </div>
      </div>

      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}
