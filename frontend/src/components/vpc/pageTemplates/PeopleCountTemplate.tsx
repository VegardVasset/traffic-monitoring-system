"use client";

import React, { useMemo, useState, useEffect } from "react";
import { MOBILE_MAX_WIDTH } from "@/config/config";
import HeatmapChart from "@/components/vpc/charts/HeatmapChart";
import { UnifiedLegend } from "@/components/shared/UnifiedLegend";
import { Button } from "@/components/ui/button";
import {
  useData,
  BaseEvent as DataContextBaseEvent,
} from "@/context/DataContext";
import PeopleCountChart from "@/components/vpc/charts/PeopleCountChart";
import DesktopFilters from "@/components/shared/DesktopFilters";
import MobileFiltersSheet from "@/components/shared/MobileFiltersSheet";

export interface PassengerEvent extends DataContextBaseEvent {
  passengerCount: number;
}

interface PeopleCountTemplateProps {
  children?: React.ReactNode;
}

export default function PeopleCountTemplate({
  children,
}: PeopleCountTemplateProps) {
  const { data, loading, isLive, setIsLive } = useData();

  const [selectedCamera, setSelectedCamera] = useState<string>("all");
  const [selectedVehicleTypes, setSelectedVehicleTypes] = useState<string[]>([]);
  const [binSize, setBinSize] = useState<"hour" | "day" | "week" | "month">(
    "day"
  );

  const today = new Date().toISOString().substring(0, 10);
  const oneWeekAgo = new Date(new Date().setDate(new Date().getDate() - 7))
    .toISOString()
    .substring(0, 10);
  const [startDate, setStartDate] = useState<string>(oneWeekAgo);
  const [endDate, setEndDate] = useState<string>(today);

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
      const matchCamera =
        selectedCamera === "all" || event.camera === selectedCamera;
      const matchVehicle =
        selectedVehicleTypes.length === 0 ||
        selectedVehicleTypes.includes(event.vehicleType);
      return withinDateRange && matchCamera && matchVehicle;
    });
  }, [data, selectedCamera, selectedVehicleTypes, startDate, endDate]);

  const passengerData: PassengerEvent[] = filteredData.map((event) => {
    const extendedEvent = event as DataContextBaseEvent & {
      passengerCount?: number;
    };
    return {
      ...extendedEvent,
      passengerCount: extendedEvent.passengerCount ?? 0,
    };
  });

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

  if (loading && !isLive) {
    return <p className="text-gray-500">Loading data...</p>;
  }

  return (
    <div className="px-2 md:px-4 py-2 md:py-4 w-full">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4">
          Person Counting Statistics
        </h1>
        <div className="block lg:hidden">
          <Button variant="outline" onClick={() => setMobileFilterOpen(true)}>
            Open Filters
          </Button>
        </div>
      </div>

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

      <MobileFiltersSheet
        domainTitle="VPC"
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

      <UnifiedLegend vehicleTypes={filteredVehicleTypes} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-2">
        <div
          className="relative w-full"
          style={{ aspectRatio: isMobile ? "1 / 1" : "1.5 / 1" }}
        >
          <div className="absolute inset-0 bg-white shadow rounded-lg p-2">
            <HeatmapChart data={passengerData} isMobile={isMobile} />
          </div>
        </div>

        <div
          className="relative w-full"
          style={{ aspectRatio: isMobile ? "1 / 1" : "1.5 / 1" }}
        >
          <div className="absolute inset-0 bg-white shadow rounded-lg p-2">
            <PeopleCountChart data={passengerData} />
          </div>
        </div>
      </div>

      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}
