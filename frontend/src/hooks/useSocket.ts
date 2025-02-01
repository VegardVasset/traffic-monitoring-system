"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:4000"; // Adjust if needed

export function useSocket(domain: string) {
  const [liveData, setLiveData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const socket = io(SOCKET_URL);

    socket.on("connect", () => {
      console.log(`Connected to WebSocket for ${domain}`);
      socket.emit("requestData", domain); // Request initial data from backend
    });

    socket.on("initialData", (initialData) => {
      console.log(`Received initial data for ${domain}:`, initialData);
      setLiveData(initialData); // Set initial data from API
    });

    socket.on("newData", (newData) => {
      console.log(`Received new data for ${domain}:`, newData);

      if (newData) {
        setLiveData((prevData) => [newData, ...prevData].slice(0, 100)); // Append new events
      }
    });

    socket.on("error", (errorMessage) => {
      setError(errorMessage.message);
      console.error("WebSocket Error:", errorMessage);
    });

    return () => {
      socket.disconnect();
    };
  }, [domain]);

  return { liveData, error };
}
