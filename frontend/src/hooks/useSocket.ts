"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:4000"; // Adjust if needed

export function useSocket(domain: string, isLive: boolean) {
  const [liveData, setLiveData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLive) {
      // Do not open a socket connection when live updates are off.
      return;
    }
    const socket = io(SOCKET_URL);

    socket.on("connect", () => {
      console.log(`Connected to WebSocket for ${domain}`);
      socket.emit("requestData", domain); // Request initial data from backend
    });

    socket.on("initialData", (initialData) => {
      console.log(`Received initial data for ${domain}:`, initialData);
      setLiveData(initialData); // Set initial data from the backend
    });

    socket.on("newData", (newData) => {
      console.log(`Received new data for ${domain}:`, newData);
      if (newData) {
        // Prepend the new event and keep only the latest 100 items.
        setLiveData((prevData) => [newData, ...prevData].slice(0, 100));
      }
    });

    socket.on("error", (errorMessage) => {
      setError(errorMessage.message);
      console.error("WebSocket Error:", errorMessage);
    });

    // Clean up by disconnecting the socket when the component unmounts or when isLive changes.
    return () => {
      socket.disconnect();
    };
  }, [domain, isLive]);

  return { liveData, error };
}
