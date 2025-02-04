import React from "react";
import { Button } from "@/components/ui/button";

export interface Camera {
  id: string;
  name: string;
}

export interface FilterComponentProps {
  cameras: Camera[];
  selectedCamera: string;
  setSelectedCamera: (value: string) => void;
  vehicleTypes: string[];
  selectedVehicleType: string;
  setSelectedVehicleType: (value: string) => void;
  isLive: boolean;
  setIsLive: (value: boolean) => void;
}

export default function FilterComponent({
  cameras,
  selectedCamera,
  setSelectedCamera,
  vehicleTypes,
  selectedVehicleType,
  setSelectedVehicleType,
  isLive,
  setIsLive,
}: FilterComponentProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4 py-4">
      {/* Camera Dropdown */}
      <div className="flex items-center">
        <label htmlFor="camera-select" className="mr-2 font-medium">
          Camera:
        </label>
        <select
          id="camera-select"
          value={selectedCamera}
          onChange={(e) => setSelectedCamera(e.target.value)}
          className="border rounded p-1"
        >
          <option value="all">All Cameras</option>
          {cameras.map((camera) => (
            <option key={camera.id} value={camera.id}>
              {camera.name}
            </option>
          ))}
        </select>
      </div>
      {/* Vehicle Type Dropdown */}
      <div className="flex items-center">
        <label htmlFor="vehicleType-select" className="mr-2 font-medium">
          Vehicle Type:
        </label>
        <select
          id="vehicleType-select"
          value={selectedVehicleType}
          onChange={(e) => setSelectedVehicleType(e.target.value)}
          className="border rounded p-1"
        >
          <option value="all">All Vehicle Types</option>
          {vehicleTypes.map((vt) => (
            <option key={vt} value={vt}>
              {vt}
            </option>
          ))}
        </select>
      </div>
      {/* LIVE Button */}
      <div>
        <Button
          variant={isLive ? "destructive" : "outline"}
          onClick={() => setIsLive(!isLive)}
        >
          {isLive ? "Stop LIVE" : "LIVE"}
        </Button>
      </div>
    </div>
  );
}
