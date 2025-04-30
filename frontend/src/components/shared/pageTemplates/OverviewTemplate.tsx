// src/components/shared/pageTemplates/OverviewTemplate.tsx
"use client";

import React, {
  Profiler,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { MOBILE_MAX_WIDTH } from "@/config/config";
import TimeSeriesChart from "@/components/shared/charts/timeSeriesChart/TimeSeriesChart";
import VehicleDistributionChart from "@/components/shared/charts/VehicleDistributionChart";
import { UnifiedLegend } from "@/components/shared/UnifiedLegend";
import { Button } from "@/components/ui/button";
import { useData } from "@/context/DataContext";
import DesktopFilters from "@/components/shared/DesktopFilters";
import MobileFiltersSheet from "@/components/shared/MobileFiltersSheet";
import DrillDownSheet from "@/components/shared/DrillDownSheet";
import { useAnalytics } from "@/context/AnalyticsContext";

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
  const { data, loading, isLive, setIsLive, refetch } = useData();
  const { logEvent } = useAnalytics();

  const domainTitle = OVERVIEW_TITLES[domain] || "Overview";
  const [selectedCamera, setSelectedCamera] = useState<string>("all");
  const [selectedVehicleTypes, setSelectedVehicleTypes] = useState<string[]>(
    []
  );
  const [binSize, setBinSize] = useState<typeof defaultBinSize>(defaultBinSize);

  const today = new Date().toISOString().substring(0, 10);
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .substring(0, 10);
  const [startDate, setStartDate] = useState<string>(oneWeekAgo);
  const [endDate, setEndDate] = useState<string>(today);

  const derivedVehicleTypes = useMemo(() => {
    const types = new Set<string>();
    data.forEach((evt) => types.add(evt.vehicleType));
    return Array.from(types);
  }, [data]);

  const derivedCameras = useMemo(() => {
    const cams = new Map<string, string>();
    data.forEach((evt) => cams.set(evt.camera, evt.camera));
    return Array.from(cams, ([id, name]) => ({ id, name }));
  }, [data]);

  const filteredData = useMemo(() => {
    return data.filter((evt) => {
      const dateStr = evt.creationTime.substring(0, 10);
      const inRange = dateStr >= startDate && dateStr <= endDate;
      const cameraOk = selectedCamera === "all" || evt.camera === selectedCamera;
      const vehicleOk =
        selectedVehicleTypes.length === 0 ||
        selectedVehicleTypes.includes(evt.vehicleType);
      return inRange && cameraOk && vehicleOk;
    });
  }, [data, startDate, endDate, selectedCamera, selectedVehicleTypes]);

  const filteredVehicleTypes = useMemo(() => {
    const types = new Set<string>();
    filteredData.forEach((evt) => types.add(evt.vehicleType));
    return Array.from(types);
  }, [filteredData]);

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const onResize = () =>
      setIsMobile(window.innerWidth < MOBILE_MAX_WIDTH);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

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

  const getDrillDownData = useCallback(() => {
    if (!drillDownBinKey) return [];
    if (binSize === "day") {
      return filteredData.filter((evt) =>
        evt.creationTime.substring(0, 10) === drillDownBinKey
      );
    }
    if (binSize === "week") {
      const start = new Date(drillDownBinKey);
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      return filteredData.filter((evt) => {
        const d = new Date(evt.creationTime.substring(0, 10));
        return d >= start && d <= end;
      });
    }
    if (binSize === "month") {
      return filteredData.filter((evt) =>
        evt.creationTime.startsWith(drillDownBinKey)
      );
    }
    return [];
  }, [binSize, drillDownBinKey, filteredData]);

  const drillDownData = getDrillDownData();
  const drillDownVehicleTypes = useMemo(() => {
    const set = new Set<string>();
    drillDownData.forEach((evt) => set.add(evt.vehicleType));
    return Array.from(set);
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
              {domainTitle} Overview
            </h1>
            <div className="block lg:hidden">
              <Button
                variant="outline"
                onClick={() => setMobileFilterOpen(true)}
              >
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
                <Profiler
                  id="TimeSeriesChart"
                  onRender={(id, phase, actualDuration) => {
                    if (phase === "mount") {
                      logEvent("Component mount time", {
                        component: id,
                        duration: actualDuration.toFixed(2),
                      });
                    }
                  }}
                >
                  <TimeSeriesChart
                    data={filteredData}
                    binSize={binSize}
                    startDate={startDate}
                    onDataPointClick={handleDataPointClick}
                  />
                </Profiler>
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
