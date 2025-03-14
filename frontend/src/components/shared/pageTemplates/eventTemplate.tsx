"use client";

import React, { useMemo, useState } from "react";
import FilterPanel, { Camera } from "@/components/shared/filterPanel";
import EventTable from "@/components/shared/eventTable";
import { useData } from "@/context/DataContext";
import { BaseEvent } from "@/context/DataContext"; // Reuse the BaseEvent type from your context

interface EventTemplateProps {
  /** Domain identifier (e.g., "dts", "vpc", "tires") */
  domain: string;
}

export default function EventTemplate({ domain }: EventTemplateProps) {
  const [selectedCamera, setSelectedCamera] = useState<string>("all");
  const [selectedVehicleTypes, setSelectedVehicleTypes] = useState<string[]>(
    []
  );
  const [binSize, setBinSize] = useState<"hour" | "day" | "week" | "month">("day");

  const { data, loading, isLive, setIsLive } = useData();

  // Derive unique cameras
  const derivedCameras: Camera[] = useMemo(() => {
    const camMap = new Map<string, string>();
    data.forEach((event: BaseEvent) => {
      camMap.set(event.camera, event.camera);
    });
    return Array.from(camMap, ([id, name]) => ({ id, name }));
  }, [data]);

  // Derive unique vehicle types
  const derivedVehicleTypes: string[] = useMemo(() => {
    const types = new Set<string>();
    data.forEach((event: BaseEvent) => types.add(event.vehicleType));
    return Array.from(types);
  }, [data]);

  if (loading) {
    return <p className="text-gray-500">Loading {domain} events...</p>;
  }

  return (
    // Make the container full width on small screens and add responsive padding
    <div className="max-w-full px-1 py-6 sm:px-6">
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4">
        Passings
      </h1>

      {/* Filter component */}
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
        useCardWrapper={true}
      />

      {/* Wrap table in an overflow-x container to allow horizontal scroll if it’s too wide */}
      <div className="mt-4 overflow-x-auto">
        <EventTable
          domain={domain}
          selectedCamera={selectedCamera}
          selectedVehicleTypes={selectedVehicleTypes}
        />
      </div>
    </div>
  );
}
