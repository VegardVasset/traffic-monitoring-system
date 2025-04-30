"use client";

import React, { Profiler, useMemo, useState } from "react";
import FilterPanel, { Camera } from "@/components/shared/FilterPanel";
import PassingsTable from "@/components/shared/table/PassingsTable";
import { useData, BaseEvent } from "@/context/DataContext";
import { useAnalytics } from "@/context/AnalyticsContext";

interface PassingsTemplateProps {
  domain: string;
}

export default function PassingsTemplate({ domain }: PassingsTemplateProps) {
  const [selectedCamera, setSelectedCamera] = useState<string>("all");
  const [selectedVehicleTypes, setSelectedVehicleTypes] = useState<string[]>([]);
  const [binSize, setBinSize] = useState<"hour" | "day" | "week" | "month">("day");

  const { data, loading, isLive, setIsLive } = useData();
  const { logEvent } = useAnalytics();

  const derivedCameras: Camera[] = useMemo(() => {
    const camMap = new Map<string, string>();
    data.forEach((event: BaseEvent) => {
      camMap.set(event.camera, event.camera);
    });
    return Array.from(camMap, ([id, name]) => ({ id, name }));
  }, [data]);

  const derivedVehicleTypes: string[] = useMemo(() => {
    const types = new Set<string>();
    data.forEach((event: BaseEvent) => types.add(event.vehicleType));
    return Array.from(types);
  }, [data]);

  if (loading) {
    return <p className="text-gray-500" aria-live="polite">Loading {domain} events...</p>;
  }

  return (
    <div className="max-w-full px-1 py-6 sm:px-6">
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4" tabIndex={0}>
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
        <Profiler
          id="PassingsTable"
          onRender={(id, phase, actualDuration) => {
            if (phase === "mount") {
              logEvent("Component mount time", {
                component: id,
                duration: actualDuration.toFixed(2),
              });
            }
          }}
        >
          <PassingsTable
            domain={domain}
            selectedCamera={selectedCamera}
            selectedVehicleTypes={selectedVehicleTypes}
          />
        </Profiler>
      </div>
    </div>
  );
}