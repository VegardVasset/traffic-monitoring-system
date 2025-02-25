"use client";

import React, { useMemo, useState, useCallback } from "react";
import FilterComponent from "@/components/shared/filterComponent";
import PeriodFilter from "@/components/shared/periodFilter";
import EventSummary from "@/components/shared/eventSummary";
import TimeSeriesChart from "@/components/shared/charts/timeSeriesChart";
import VehicleDistributionChart from "@/components/shared/charts/vehicleDistributionChart";
import { useData } from "@/context/DataContext";

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
  const { data, loading, isLive, setIsLive } = useData();

  const [selectedCamera, setSelectedCamera] = useState<string>("all");
  const [selectedVehicleTypes, setSelectedVehicleTypes] = useState<string[]>([]);
  const [binSize, setBinSize] = useState<"hour" | "day" | "week">(defaultBinSize);

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

  if (loading && !isLive) {
    return <p className="text-gray-500">Loading {domainTitle} data...</p>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">{domainTitle} Overview</h1>

      <FilterComponent
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
        showLiveButton={true}
      />

      <div className="mt-6">
        <PeriodFilter
          startDate={startDate}
          endDate={endDate}
          onChange={handlePeriodChange}
        />
      </div>

      <EventSummary
        count={filteredData.length}
        startDate={startDate}
        endDate={endDate}
      />

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 h-[500px]">
        <div className="bg-white shadow rounded-lg p-4 overflow-hidden">
          <TimeSeriesChart data={filteredData} binSize={binSize} />
        </div>
        <div className="bg-white shadow rounded-lg p-4 overflow-hidden">
          <VehicleDistributionChart data={filteredData} />
        </div>
      </div>

      {/* Render any additional children (like our TireConditionChart) */}
      {children && <div className="mt-8">{children}</div>}
    </div>
  );
}
