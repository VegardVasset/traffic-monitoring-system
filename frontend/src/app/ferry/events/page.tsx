"use client";

import { useState } from "react";
import FilterComponent, { Camera } from "@/components/shared/filterComponent";
import EventTable from "@/components/shared/eventTable";

// Use the camera names as provided by your backend for the "ferry" domain.
const ferryCameras: Camera[] = [
  { id: "Os", name: "Os" },
  { id: "Manheller", name: "Manheller" },
  { id: "Lavik", name: "Lavik" },
];

// List of vehicle types as defined in your backend's vehicle distribution
const vehicleTypes = [
  "person transport",
  "buss",
  "motorsykkel",
  "lastebil lukket",
  "lastebil åpen",
  "lett industri",
  "tilhenger",
  "camping kjøretøy",
  "utrykningskjøretøy",
  "lastebil sylinder",
  "myke trafikanter",
  "traktor",
];

export default function FerryPage() {
  const [selectedCamera, setSelectedCamera] = useState<string>("all");
  const [selectedVehicleType, setSelectedVehicleType] = useState<string>("all");
  const [isLive, setIsLive] = useState<boolean>(false); // NEW: Live toggle

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Ferry Counter</h1>
      <FilterComponent
        cameras={ferryCameras}
        selectedCamera={selectedCamera}
        setSelectedCamera={setSelectedCamera}
        vehicleTypes={vehicleTypes}
        selectedVehicleType={selectedVehicleType}
        setSelectedVehicleType={setSelectedVehicleType}
        isLive={isLive}             // Pass live mode state
        setIsLive={setIsLive}       // Pass the state updater
      />
      <EventTable
        domain="ferry"
        selectedCamera={selectedCamera}
        selectedVehicleType={selectedVehicleType}
        isLive={isLive}             // Pass live mode state so the socket connects when needed
      />
    </div>
  );
}
