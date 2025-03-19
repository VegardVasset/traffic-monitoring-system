// eventTemplate.tsx
"use client";

import React, { useMemo, useState } from "react";
import FilterPanel, { Camera } from "@/components/shared/filterPanel";
import PassingsTable from "@/components/shared/passingsTable";
import { useData } from "@/context/DataContext";
import { BaseEvent } from "@/context/DataContext";

interface PassingsTemplateProps {
  domain: string;
}

export default function PassingsTemplate({ domain }: PassingsTemplateProps) {
  const [selectedCamera, setSelectedCamera] = useState<string>("all");
  const [selectedVehicleTypes, setSelectedVehicleTypes] = useState<string[]>([]);
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
    <div className="max-w-full px-1 py-6 sm:px-6">
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4">
        Passings
      </h1>
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
      <div className="mt-4 overflow-x-auto">
        <PassingsTable
          domain={domain}
          selectedCamera={selectedCamera}
          selectedVehicleTypes={selectedVehicleTypes}
        />
      </div>
    </div>
  );
}