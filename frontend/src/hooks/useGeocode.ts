"use client";

import { useState, useEffect } from "react";

interface Location {
  lat: number;
  lng: number;
}

const useGeocode = (placeName: string) => {
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!placeName) return;
    setLoading(true);
    fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        placeName
      )}&format=json`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data && data.length > 0) {
          const { lat, lon } = data[0];
          setLocation({ lat: parseFloat(lat), lng: parseFloat(lon) });
          setError(null);
        } else {
          setError("No results found");
        }
      })
      .catch((err) => {
        setError(err.message || "Error fetching location");
      })
      .finally(() => setLoading(false));
  }, [placeName]);

  return { location, loading, error };
};

export default useGeocode;
