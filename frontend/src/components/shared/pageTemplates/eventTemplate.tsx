"use client";

import React, { useEffect, useMemo, useState } from "react";
import FilterComponent, { Camera } from "@/components/shared/filterComponent";
import EventTable from "@/components/shared/eventTable";

export interface BaseEvent {
  id: number;
  creationTime: string;
  receptionTime: string;
  vehicleType: string;
  camera: string;
  // ... any other fields you use
}

interface EventTemplateProps {
  /** Domain identifier (e.g., "dts", "ferry", "tires") */
  domain: string;
  /** Title for the page header */
  title: string;
  /** API endpoint from which to fetch events */
  apiUrl: string;
}

export default function EventTemplate({
  domain,
  title,
  apiUrl,
}: EventTemplateProps) {
  // Filter state
  const [selectedCamera, setSelectedCamera] = useState<string>("all");
  const [selectedVehicleTypes, setSelectedVehicleTypes] = useState<string[]>([]);
  const [binSize, setBinSize] = useState<"hour" | "day" | "week">("day");
  const [isLive, setIsLive] = useState<boolean>(false);

  // Data fetching state
  const [data, setData] = useState<BaseEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch events from the API
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(apiUrl);
        if (!res.ok) throw new Error("Failed to fetch data");
        const jsonData = await res.json();
        setData(jsonData);
      } catch (error) {
        console.error(`Error fetching ${domain} events:`, error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [apiUrl, isLive, domain]);

  // Derive unique cameras from the events data
  const derivedCameras: Camera[] = useMemo(() => {
    const camMap = new Map<string, string>();
    data.forEach((event) => {
      camMap.set(event.camera, event.camera);
    });
    return Array.from(camMap, ([id, name]) => ({ id, name }));
  }, [data]);

  // Derive unique vehicle types from the events data
  const derivedVehicleTypes: string[] = useMemo(() => {
    const types = new Set<string>();
    data.forEach((event) => types.add(event.vehicleType));
    return Array.from(types);
  }, [data]);

  if (loading) {
    return <p className="text-gray-500">Loading {domain} events...</p>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Passings</h1>

      {/* Filter component WITHOUT the bin size */}
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

        /** Pass showBinSize={false} to remove the dropdown */
        showBinSize={false}
      />

      {/* Event table */}
      <EventTable
        domain={domain}
        selectedCamera={selectedCamera}
        selectedVehicleTypes={selectedVehicleTypes}
        isLive={isLive}
      />
    </div>
  );
}
