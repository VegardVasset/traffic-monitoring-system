"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";

import FilterPanel from "@/components/shared/filterPanel";
import PeriodFilter from "@/components/shared/periodFilter";
import EventSummary from "@/components/shared/eventSummary";
import TimeSeriesChart from "@/components/shared/charts/timeSeriesChart";
import VehicleDistributionChart from "@/components/shared/charts/vehicleDistributionChart";

// ShadCN UI
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

export interface BaseEvent {
  id: number;
  creationTime: string;
  receptionTime: string;
  vehicleType: string;
  camera: string;
}

interface OverviewTemplateProps {
  apiUrl: string;
  domainTitle: string;
  defaultBinSize?: "hour" | "day" | "week";
}

export default function OverviewTemplate({
  apiUrl,
  domainTitle,
  defaultBinSize = "day",
}: OverviewTemplateProps) {
  const [selectedCamera, setSelectedCamera] = useState<string>("all");
  const [selectedVehicleTypes, setSelectedVehicleTypes] = useState<string[]>([]);
  const [binSize, setBinSize] = useState<"hour" | "day" | "week">(defaultBinSize);
  const [isLive, setIsLive] = useState<boolean>(false);

  // Default date range: from 1 month ago to today
  const today = new Date().toISOString().substring(0, 10);
  const oneMonthAgo = new Date(new Date().setMonth(new Date().getMonth() - 1))
    .toISOString()
    .substring(0, 10);

  const [startDate, setStartDate] = useState<string>(oneMonthAgo);
  const [endDate, setEndDate] = useState<string>(today);

  const [data, setData] = useState<BaseEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // State to control the mobile drawer
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(apiUrl);
        if (!res.ok) throw new Error("Failed to fetch data");
        const jsonData = await res.json();
        setData(jsonData);
      } catch (error) {
        console.error(`Error fetching ${domainTitle} data:`, error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [apiUrl, isLive, domainTitle]);

  const handlePeriodChange = useCallback((start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
  }, []);

  // Derive unique vehicle types
  const derivedVehicleTypes = useMemo(() => {
    const types = new Set<string>();
    data.forEach((event) => types.add(event.vehicleType));
    return Array.from(types);
  }, [data]);

  // Derive unique cameras
  const derivedCameras = useMemo(() => {
    const cams = new Map<string, string>();
    data.forEach((event) => {
      cams.set(event.camera, event.camera);
    });
    return Array.from(cams, ([id, name]) => ({ id, name }));
  }, [data]);

  // Filtered data
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

  if (loading) {
    return <p className="text-gray-500">Loading {domainTitle} data...</p>;
  }

  return (
    <div className="px-0 md:px-6 py-4 md:py-6 w-full">
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

        {/* We use SheetTrigger as a placeholder; the button above calls setMobileFilterOpen(true). */}
        <SheetTrigger asChild>
          <div />
        </SheetTrigger>
      </Sheet>

      {/* ===================== Charts ===================== */}
      {/*
        1. We wrap both chart containers in a grid.
        2. We give them a larger minimum height, e.g. 500px or 600px.
        3. Each chart container uses `h-full` internally to fill up the space.
      */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
        <div className="
    bg-white shadow rounded-lg p-4
 overflow-hidden
    h-auto md:min-h-[600px] xl:min-h-[700px]
  ">
          <TimeSeriesChart data={filteredData} binSize={binSize} />
        </div>
        <div className="bg-white shadow rounded-lg  p-2 overflow-hidden 
                min-h-[300px] md:min-h-[400px] xl:min-h-[700px]">
  <VehicleDistributionChart data={filteredData} />
</div>
      </div>
    </div>
  );
}
