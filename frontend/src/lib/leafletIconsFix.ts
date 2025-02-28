"use client";

import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Optional: remove Leaflet's default logic for the icon path
// delete (L.Icon.Default.prototype as any)._getIconUrl;

// Point Leaflet’s default icon URLs to the files in /public
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "/marker-icon-2x.png",
  iconUrl: "/marker-icon.png",
  shadowUrl: "/marker-shadow.png",
});
