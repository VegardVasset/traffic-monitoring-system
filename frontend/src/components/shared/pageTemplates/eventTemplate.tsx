"use client";

import React, { useMemo, useState } from "react";
import FilterPanel, { Camera } from "@/components/shared/filterPanel";
import EventTable from "@/components/shared/eventTable";
import { useData } from "@/context/DataContext";
import { BaseEvent } from "@/context/DataContext"; // Reuse the BaseEvent type from your context

interface EventTemplateProps {
  /** Domain identifier (e.g., "dts", "ferry", "tires") */
  domain: string;
}

export default function EventTemplate({ domain }: EventTemplateProps) {
  // Local filter state
  const [selectedCamera, setSelectedCamera] = useState<string>("all");
  const [selectedVehicleTypes, setSelectedVehicleTypes] = useState<string[]>([]);
  const [binSize, setBinSize] = useState<"hour" | "day" | "week">("day");

  // Get shared data and live mode state from the DataContext
  const { data, loading, isLive, setIsLive } = useData();

  // Derive unique cameras from the events data
  const derivedCameras: Camera[] = useMemo(() => {
    const camMap = new Map<string, string>();
    data.forEach((event: BaseEvent) => {
      camMap.set(event.camera, event.camera);
    });
    return Array.from(camMap, ([id, name]) => ({ id, name }));
  }, [data]);

  // Derive unique vehicle types from the events data
  const derivedVehicleTypes: string[] = useMemo(() => {
    const types = new Set<string>();
    data.forEach((event: BaseEvent) => types.add(event.vehicleType));
    return Array.from(types);
  }, [data]);

  if (loading) {
    return <p className="text-gray-500">Loading {domain} events...</p>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Passings</h1>

      {/* Filter component WITHOUT the bin size */}
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
        showBinSize={false}
      />

      {/* Event table */}
      <EventTable
        domain={domain}
        selectedCamera={selectedCamera}
        selectedVehicleTypes={selectedVehicleTypes}
      />
    </div>
  );
}
