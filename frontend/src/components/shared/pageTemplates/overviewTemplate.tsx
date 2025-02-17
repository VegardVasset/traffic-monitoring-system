"use client";

import React, { useEffect, useMemo, useState } from "react";
import FilterComponent from "@/components/shared/filterComponent";
import PeriodFilter from "@/components/shared/periodFilter";
import EventSummary from "@/components/shared/eventSummary";
import TimeSeriesChart from "@/components/shared/charts/timeSeriesChart";
import VehicleDistributionChart from "@/components/shared/charts/vehicleDistributionChart";

export interface BaseEvent {
  id: number;
  creationTime: string;
  receptionTime: string;
  vehicleType: string;
  camera: string;
  // ... other fields if needed
}

interface OverviewTemplateProps {
  /** The API endpoint for this domain's data */
  apiUrl: string;
  /** Title to display at the top (e.g. "Tire Scanner", "Ferry", etc.) */
  domainTitle: string;
  /** Optional default bin size */
  defaultBinSize?: "hour" | "day" | "week";
}

export default function OverviewTemplate({
  apiUrl,
  domainTitle,
  defaultBinSize = "day",
}: OverviewTemplateProps) {
  // Filter states
  const [selectedCamera, setSelectedCamera] = useState<string>("all");
  const [selectedVehicleType, setSelectedVehicleType] = useState<string>("all");
  const [binSize, setBinSize] = useState<"hour" | "day" | "week">(defaultBinSize);
  const [isLive, setIsLive] = useState<boolean>(false);

  // Period filter states
  const today = new Date().toISOString().substring(0, 10);
  const oneMonthAgo = new Date(new Date().setMonth(new Date().getMonth() - 1))
    .toISOString()
    .substring(0, 10);
  const [startDate, setStartDate] = useState<string>(oneMonthAgo);
  const [endDate, setEndDate] = useState<string>(today);

  // Data and loading states
  const [data, setData] = useState<BaseEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch the events data from the API
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

  // Handle period changes from the PeriodFilter
  const handlePeriodChange = (start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
  };

  // Derive unique vehicle types from the data
  const derivedVehicleTypes = useMemo(() => {
    const types = new Set<string>();
    data.forEach(event => types.add(event.vehicleType));
    return Array.from(types);
  }, [data]);

  // Derive unique cameras from the data
  const derivedCameras = useMemo(() => {
    const cams = new Map<string, string>();
    data.forEach(event => {
      cams.set(event.camera, event.camera);
    });
    return Array.from(cams, ([id, name]) => ({ id, name }));
  }, [data]);

  // Filter the data based on the current filters
  const filteredData = useMemo(() => {
    return data.filter(event => {
      const eventDate = event.creationTime.substring(0, 10);
      const withinDateRange = eventDate >= startDate && eventDate <= endDate;
      const matchCamera = selectedCamera === "all" || event.camera === selectedCamera;
      const matchVehicle =
        selectedVehicleType === "all" || event.vehicleType === selectedVehicleType;
      return withinDateRange && matchCamera && matchVehicle;
    });
  }, [data, selectedCamera, selectedVehicleType, startDate, endDate]);

  if (loading) {
    return <p className="text-gray-500">Loading {domainTitle} data...</p>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">{domainTitle} Overview</h1>

      {/* Filters */}
      <FilterComponent
        cameras={derivedCameras}
        selectedCamera={selectedCamera}
        setSelectedCamera={setSelectedCamera}
        vehicleTypes={derivedVehicleTypes}
        selectedVehicleType={selectedVehicleType}
        setSelectedVehicleType={setSelectedVehicleType}
        binSize={binSize}
        setBinSize={setBinSize}
        isLive={isLive}
        setIsLive={setIsLive}

      />

      {/* Period Filter */}
      <div className="mt-6">
        <PeriodFilter startDate={startDate} endDate={endDate} onChange={handlePeriodChange} />
      </div>

      {/* Event Summary */}
      <EventSummary count={filteredData.length} startDate={startDate} endDate={endDate} />

      {/* Charts */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Time Series Chart */}
        <div className="bg-white shadow rounded-lg p-4">
          <TimeSeriesChart
            data={filteredData}
            vehicleTypes={derivedVehicleTypes}
            binSize={binSize}
          />
        </div>

        {/* Vehicle Distribution Chart */}
        <div className="bg-white shadow rounded-lg p-4">
          <VehicleDistributionChart data={filteredData} />
        </div>
      </div>
    </div>
  );
}
