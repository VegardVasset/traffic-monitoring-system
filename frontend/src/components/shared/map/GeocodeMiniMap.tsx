"use client";

import React, { useEffect } from "react";
import dynamic from "next/dynamic";
import useGeocode from "@/hooks/useGeocode";
import "leaflet/dist/leaflet.css";

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

import { Icon } from "leaflet";

interface ExtendedIconDefault extends Icon {
  _getIconUrl?: () => string;
}

interface GeocodedMiniMapProps {
  cameraName: string;
  onClick: (coords: { lat: number; lng: number }) => void;
}

export default function GeocodedMiniMap({ cameraName, onClick }: GeocodedMiniMapProps) {
  const { location, loading, error } = useGeocode(cameraName);

  useEffect(() => {
    if (typeof window !== "undefined") {
      import("leaflet").then((module) => {
        const L = module.default;
        delete (L.Icon.Default.prototype as ExtendedIconDefault)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: "/marker-icon-2x.png",
          iconUrl: "/marker-icon.png",
          shadowUrl: "/marker-shadow.png",
        });
      });
    }
  }, []);

  if (loading) {
    return <p className="text-sm text-gray-500">Loading map…</p>;
  }

  if (error || !location) {
    return <p className="text-sm text-red-500">Map unavailable</p>;
  }

  return (
    <div
      onClick={() => onClick(location)}
      style={{ width: "150px", height: "100px", cursor: "pointer" }}
    >
      <MapContainer
        center={[location.lat, location.lng]}
        zoom={13}
        scrollWheelZoom={false}
        style={{ width: "100%", height: "100%", zIndex: 0, position: "relative" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="© OpenStreetMap contributors"
        />
        <Marker position={[location.lat, location.lng]} />
      </MapContainer>
    </div>
  );
}
