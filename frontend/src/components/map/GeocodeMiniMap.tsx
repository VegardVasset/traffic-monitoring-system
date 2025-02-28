"use client";

import React from "react";
import dynamic from "next/dynamic";
import useGeocode from "@/hooks/useGeocode";
import "leaflet/dist/leaflet.css";

// Dynamically import react-leaflet components with SSR disabled.
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);

interface GeocodedMiniMapProps {
  cameraName: string;
  onClick: (coords: { lat: number; lng: number }) => void;
}

const GeocodedMiniMap: React.FC<GeocodedMiniMapProps> = ({
  cameraName,
  onClick,
}) => {
  const { location, loading, error } = useGeocode(cameraName);

  if (loading)
    return <p className="text-sm text-gray-500">Loading map…</p>;
  if (error || !location)
    return <p className="text-sm text-red-500">Map unavailable</p>;

  return (
    <div
      onClick={() => onClick(location)}
      style={{ width: "150px", height: "100px", cursor: "pointer" }}
    >
      <MapContainer
        center={[location.lat, location.lng]}
        zoom={13}
        scrollWheelZoom={false}
        style={{ width: "100%", height: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='© OpenStreetMap contributors'
        />
        <Marker position={[location.lat, location.lng]} />
      </MapContainer>
    </div>
  );
};

export default GeocodedMiniMap;
