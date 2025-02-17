// useSocket.ts
"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";

// Hardcode your Railway domain here:
const SOCKET_URL = "https://traffic-monitoring-system-production.up.railway.app";

export function useSocket(domain: string, isLive: boolean) {
  const [liveData, setLiveData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLive) return;

    // Initialize the Socket.IO client
    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      console.log(`Connected to WebSocket for ${domain}`);
      // Request initial data for the given domain
      socket.emit("requestData", domain);
    });

    socket.on("initialData", (initialData) => {
      setLiveData(initialData);
    });

    socket.on("newData", (newData) => {
      if (newData) {
        // Prepend the new event and limit to the last 100 items
        setLiveData((prev) => [newData, ...prev].slice(0, 100));
      }
    });

    socket.on("error", (errorMessage) => {
      setError(errorMessage.message);
      console.error("WebSocket Error:", errorMessage);
    });

    return () => {
      // Disconnect when the component unmounts or isLive changes to false
      socket.disconnect();
    };
  }, [domain, isLive]);

  return { liveData, error };
}
