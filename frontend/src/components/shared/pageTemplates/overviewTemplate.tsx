"use client";

import React, { useCallback, useMemo, useState, useEffect } from "react";
import { MOBILE_MAX_WIDTH } from "@/config/config";
import TimeSeriesChart from "@/components/shared/charts/timeSeriesChart/TimeSeriesChart";
import VehicleDistributionChart from "@/components/shared/charts/VehicleDistributionChart";
import { UnifiedLegend } from "@/components/shared/UnifiedLegend";
import { Button } from "@/components/ui/button";
import { useData } from "@/context/DataContext";
import DesktopFilters from "@/components/shared/DesktopFilters";
import MobileFiltersSheet from "@/components/shared/MobileFiltersSheet";
import DrillDownSheet from "@/components/shared/DrillDownSheet";

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
  const domainTitle = OVERVIEW_TITLES[domain] || "Overview";
  const { data, loading, isLive, setIsLive, refetch } = useData();

  // Local states and derived values
  const [selectedCamera, setSelectedCamera] = useState<string>("all");
  const [selectedVehicleTypes, setSelectedVehicleTypes] = useState<string[]>([]);
  const [binSize, setBinSize] = useState<"hour" | "day" | "week" | "month">(defaultBinSize);

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
    data.forEach((event) => cams.set(event.camera, event.camera));
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

  // Drill down state and callbacks for detailed view
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

  // Updated drilldown data callback for weekly bins.
  // For a weekly drilldown, the drillDownBinKey is the ISO Monday.
  // We now simply return events from that Monday to the following Sunday.
  const getDrillDownData = useCallback(() => {
    if (!drillDownBinKey) return [];
    if (binSize === "day") {
      const dayString = drillDownBinKey.substring(0, 10);
      return filteredData.filter(
        (evt) => evt.creationTime.substring(0, 10) === dayString
      );
    } else if (binSize === "week") {
      const startOfWeek = new Date(drillDownBinKey); // This is the ISO Monday
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

  // Compute drillDownData first
  const drillDownData = getDrillDownData();

  // Then compute drillDownVehicleTypes using that data
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
            onRefetch={refetch}
            showBinSize={true}
          />

          <MobileFiltersSheet
            domainTitle={domainTitle}
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
            onRefetch={refetch}
            showBinSize={true}
          />

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
                  startDate={startDate}
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

          <DrillDownSheet
            open={drillDownOpen}
            onOpenChange={setDrillDownOpen}
            drillDownBinKey={drillDownBinKey}
            getDrillDownBinSize={getDrillDownBinSize}
            getDrillDownData={getDrillDownData}
            drillDownVehicleTypes={drillDownVehicleTypes}
            startDate={startDate}
          />
        </>
      )}
    </div>
  );
}
