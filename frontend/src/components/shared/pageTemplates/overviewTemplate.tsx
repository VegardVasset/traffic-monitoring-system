"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
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

  const today = new Date().toISOString().substring(0, 10);
  const oneMonthAgo = new Date(new Date().setMonth(new Date().getMonth() - 1))
    .toISOString()
    .substring(0, 10);
  const [startDate, setStartDate] = useState<string>(oneMonthAgo);
  const [endDate, setEndDate] = useState<string>(today);

  const [data, setData] = useState<BaseEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

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

  if (loading) {
    return <p className="text-gray-500">Loading {domainTitle} data...</p>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">{domainTitle} Overview</h1>

      {/* Filters: hide the live button by passing showLiveButton={false} */}
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
        showLiveButton={false}
      />

      {/* Period Filter */}
      <div className="mt-6">
        <PeriodFilter
          startDate={startDate}
          endDate={endDate}
          onChange={handlePeriodChange}
        />
      </div>

      <EventSummary count={filteredData.length} startDate={startDate} endDate={endDate} />

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 h-[500px]">
        <div className="bg-white shadow rounded-lg p-4 overflow-hidden">
          <TimeSeriesChart
            data={filteredData}
            binSize={binSize}
          />
        </div>
        <div className="bg-white shadow rounded-lg p-4 overflow-hidden">
          <VehicleDistributionChart data={filteredData} />
        </div>
      </div>
    </div>
  );
}
