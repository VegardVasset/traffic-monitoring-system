// components/FilterComponent.tsx
import React from "react";

export interface Camera {
  id: string;
  name: string;
}

interface FilterComponentProps {
  cameras: Camera[];
  selectedCamera: string;
  setSelectedCamera: (value: string) => void;
  // You can add additional filter props here later if needed.
}

export default function FilterComponent({
  cameras,
  selectedCamera,
  setSelectedCamera,
}: FilterComponentProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4 py-4">
      {/* Additional filters can go here */}
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
    </div>
  );
}
