"use client";

import React, { useState, useMemo } from "react";
import SpeedHistogramChart from "@/components/dts/charts/SpeedHistogramChart";
import SpeedTimeOfDayChart from "@/components/dts/charts/SpeedTimeOfDayChart";
import DesktopFilters from "@/components/shared/DesktopFilters";
import MobileFiltersSheet from "@/components/shared/MobileFiltersSheet";

// ShadCN UI components
import { Button } from "@/components/ui/button";


import { useData } from "@/context/DataContext";

export default function SpeedAnalysisTemplate() {
  // Access the global data + loading state from DataContext
  const { data, loading, isLive, setIsLive } = useData();

  // Local filter state
  const [selectedCamera, setSelectedCamera] = useState<string>("all");
  const [selectedVehicleTypes, setSelectedVehicleTypes] = useState<string[]>([]);
  const [binSize, setBinSize] = useState<"hour" | "day" | "week" | "month">("day");

  // Date range 
  const today = new Date().toISOString().substring(0, 10);
    const oneWeekAgo = new Date(new Date().setDate(new Date().getDate() - 7))
      .toISOString()
      .substring(0, 10);
    const [startDate, setStartDate] = useState<string>(oneWeekAgo);
    const [endDate, setEndDate] = useState<string>(today);

  // Derive unique cameras + vehicle types from the data
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
      const matchCamera = selectedCamera === "all" || event.camera === selectedCamera;
      const matchVehicle =
        selectedVehicleTypes.length === 0 || selectedVehicleTypes.includes(event.vehicleType);
      return withinDateRange && matchCamera && matchVehicle;
    });
  }, [data, selectedCamera, selectedVehicleTypes, startDate, endDate]);

  // For mobile: controlling the filter "drawer"
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // If still loading (and not in live mode), show a simple loading message
  if (loading && !isLive) {
    return <p className="text-gray-500">Loading speed data...</p>;
  }

  return (
    <div className="px-4 py-6">
      {/* Mobile Header with Title and Filter Button */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl md:text-3xl font-bold">Speed Analysis</h1>
        <div className="block lg:hidden">
          <Button variant="outline" onClick={() => setMobileFilterOpen(true)}>
            Open Filters
          </Button>
        </div>
      </div>

      {/* ========== Desktop Filters using Extracted Component ========== */}
           <DesktopFilters
             startDate={startDate}
             endDate={endDate}
             setStartDate={setStartDate}
             setEndDate={setEndDate}
             filteredDataCount={filteredData.length}
             derivedCameras={derivedCameras}
             selectedCamera={selectedCamera}
             setSelectedCamera={setSelectedCamera}
             derivedVehicleTypes={derivedVehicleTypes}
             selectedVehicleTypes={selectedVehicleTypes}
             setSelectedVehicleTypes={setSelectedVehicleTypes}
             binSize={binSize}
             setBinSize={setBinSize}
             isLive={isLive}
             setIsLive={setIsLive}
             showBinSize={false}
           />
     
           {/* ========== Mobile Filter Drawer using Extracted Component ========== */}
           <MobileFiltersSheet
             domainTitle="Speed Analysis"
             mobileFilterOpen={mobileFilterOpen}
             setMobileFilterOpen={setMobileFilterOpen}
             startDate={startDate}
             endDate={endDate}
             setStartDate={setStartDate}
             setEndDate={setEndDate}
             filteredDataCount={filteredData.length}
             derivedCameras={derivedCameras}
             selectedCamera={selectedCamera}
             setSelectedCamera={setSelectedCamera}
             derivedVehicleTypes={derivedVehicleTypes}
             selectedVehicleTypes={selectedVehicleTypes}
             setSelectedVehicleTypes={setSelectedVehicleTypes}
             binSize={binSize}
             setBinSize={setBinSize}
             isLive={isLive}
             setIsLive={setIsLive}
             showBinSize={false}
           />

      {/* ========== Charts ========== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Speed Histogram Chart */}
        <SpeedHistogramChart data={filteredData} />

        {/* Right: Speed Time-of-Day Chart */}
        <SpeedTimeOfDayChart data={filteredData} />
      </div>
    </div>
  );
}
