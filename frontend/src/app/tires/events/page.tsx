"use client";

import { useState } from "react";
import FilterComponent, { Camera } from "@/components/shared/filterComponent";
import EventTable from "@/components/shared/eventTable";

// Use the camera names for the tires domain as defined in your backend.
const tiresCameras: Camera[] = [
  { id: "Bergen Parkering", name: "Bergen Parkering" },
  { id: "Oslo Parkering", name: "Oslo Parkering" },
  { id: "Vardø", name: "Vardø" },
];

// List of vehicle types (can be reused across pages)
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

export default function TiresPage() {
  const [selectedCamera, setSelectedCamera] = useState<string>("all");
  const [selectedVehicleType, setSelectedVehicleType] = useState<string>("all");
  const [isLive, setIsLive] = useState<boolean>(false); // NEW: Live toggle


  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Tire Scanner</h1>
      <FilterComponent
        cameras={tiresCameras}
        selectedCamera={selectedCamera}
        setSelectedCamera={setSelectedCamera}
        vehicleTypes={vehicleTypes}
        selectedVehicleType={selectedVehicleType}
        setSelectedVehicleType={setSelectedVehicleType}
        isLive={isLive}             // Pass live mode state
        setIsLive={setIsLive}       // Pass the state updater
      />
      <EventTable
        domain="tires"
        selectedCamera={selectedCamera}
        selectedVehicleType={selectedVehicleType}
        isLive={isLive}             // Pass live mode state so the socket connects when needed
      />
    </div>
  );
}
