"use client";

import React, { useState, useMemo, useCallback } from "react";
import FilterPanel from "@/components/shared/filterPanel";
import PeriodFilter from "@/components/shared/periodFilter";
import EventSummary from "@/components/shared/eventSummary";
import TireConditionChart from "@/components/shared/charts/tires/tireConditionChart";
import TireTypeChart from "@/components/shared/charts/tires/tireTypeChart";

// ShadCN UI components (assuming you use these):
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

// Import your data context
import { useData } from "@/context/DataContext";

export default function TireAnalysisTemplate() {
  // Access the global data + loading state from DataContext
  const { data, loading, isLive, setIsLive } = useData();

  // Local filter state
  const [selectedCamera, setSelectedCamera] = useState<string>("all");
  const [selectedVehicleTypes, setSelectedVehicleTypes] = useState<string[]>([]);
  const [binSize, setBinSize] = useState<"hour" | "day" | "week">("day");

  // Date range (default: last month to today)
  const today = new Date().toISOString().substring(0, 10);
  const oneMonthAgo = new Date(new Date().setMonth(new Date().getMonth() - 1))
    .toISOString()
    .substring(0, 10);
  const [startDate, setStartDate] = useState<string>(oneMonthAgo);
  const [endDate, setEndDate] = useState<string>(today);

  // Handler for date range changes
  const handlePeriodChange = useCallback((start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
  }, []);

  // Derive the unique cameras + vehicle types from the data
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

  // Filter the data according to date range, camera, vehicle type, etc.
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

  // For mobile: controlling the filter "drawer"
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // If still loading (and not in live mode), show a simple loading message
  if (loading && !isLive) {
    return <p className="text-gray-500">Loading tire data...</p>;
  }

  return (
    <div className="px-4 py-6">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Tire Analysis</h1>

      {/* ========== Desktop Filters ========== */}
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
          showBinSize={false} // optional
          showLiveButton={false} // optional
        />
      </div>

      {/* ========== Mobile Filter Drawer Trigger ========== */}
      <div className="block md:hidden mb-4">
        <Button variant="outline" onClick={() => setMobileFilterOpen(true)}>
          Open Filters
        </Button>
      </div>

      {/* ========== Mobile Filter Drawer ========== */}
      <Sheet open={mobileFilterOpen} onOpenChange={setMobileFilterOpen}>
        <SheetContent side="right" className="w-[85%] sm:w-[400px]">
          <SheetHeader>
            <SheetTitle>Tire Analysis Filters</SheetTitle>
          </SheetHeader>

          <div className="mt-4 space-y-4">
            {/* Date Range */}
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

            {/* Event Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Passings for chosen period</CardTitle>
              </CardHeader>
              <CardContent>
                <EventSummary count={filteredData.length} />
              </CardContent>
            </Card>

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
              showLiveButton={false} // optional
            />
          </div>

          <div className="mt-4">
            <SheetClose asChild>
              <Button variant="outline">Close</Button>
            </SheetClose>
          </div>
        </SheetContent>

        {/* We need a SheetTrigger in the tree, but it can be empty if you’re manually opening */}
        <SheetTrigger asChild>
          <div />
        </SheetTrigger>
      </Sheet>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Tire Condition Bar Chart */}
        <TireConditionChart data={filteredData} />

        {/* Right: Tire Type Line Chart */}
        <TireTypeChart data={filteredData} />
      </div>
    </div>
  );
}
