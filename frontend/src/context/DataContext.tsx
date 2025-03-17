// DataContext.tsx
"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { io, Socket } from "socket.io-client";
import { useAnalytics } from "@/context/analyticsContext";

export interface BaseEvent {
  id: number;
  creationTime: string;
  receptionTime: string;
  vehicleType: string;
  camera: string;
  confidenceScore: number;
}

interface DataContextProps {
  data: BaseEvent[];
  loading: boolean;
  error: string | null;
  isLive: boolean;
  setIsLive: (live: boolean) => void;
  refetch: () => void;
  lastUpdateArrivalTime: number | null;
  updateEvent: (updatedEvent: BaseEvent) => Promise<void>;
}

const DataContext = createContext<DataContextProps | undefined>(undefined);

interface DataProviderProps {
  apiUrl: string;
  domain: string;
  children: React.ReactNode;
}

export const DataProvider = ({ apiUrl, domain, children }: DataProviderProps) => {
  const [data, setData] = useState<BaseEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState<boolean>(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [lastUpdateArrivalTime, setLastUpdateArrivalTime] = useState<number | null>(null);

  const { logEvent } = useAnalytics();
  const newDataCountRef = useRef<number>(0);

  const refetch = useCallback(async () => {
    setLoading(true);
    const startTime = performance.now();
    try {
      const res = await fetch(apiUrl);
      if (!res.ok) throw new Error("Failed to fetch data");
      const jsonData = await res.json();
      setData(jsonData);
      setError(null);
      const fetchDuration = performance.now() - startTime;
      logEvent("REST fetch completed", { fetchDuration });
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error(`Error fetching data for ${domain}:`, err);
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  }, [apiUrl, domain, logEvent]);

  // New: updateEvent function
  const updateEvent = useCallback(async (updatedEvent: BaseEvent) => {
    try {
      // Replace the URL with your actual endpoint for updating events.
      const res = await fetch(`${apiUrl}/${updatedEvent.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedEvent),
      });
      if (!res.ok) {
        throw new Error("Failed to update event");
      }
      // Update local state once backend update is successful.
      setData((prev) =>
        prev.map((ev) => (ev.id === updatedEvent.id ? updatedEvent : ev))
      );
    } catch (error) {
      console.error("Error updating event", error);
    }
  }, [apiUrl]);

  useEffect(() => {
    if (!isLive && socket) {
      socket.disconnect();
      setSocket(null);
    }
  }, [isLive, socket]);

  useEffect(() => {
    if (!isLive) return;
    const newSocket: Socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log(`Connected to WebSocket for ${domain}`);
      newSocket.emit("requestData", domain);
    });

    newSocket.on("initialData", (initialData: BaseEvent[]) => {
      setData(initialData);
      setLoading(false);
      setError(null);
    });

    newSocket.on("newData", (newData: BaseEvent) => {
      const arrivalTime = performance.now();
      setLastUpdateArrivalTime(arrivalTime);
      setData((prev) => [newData, ...prev]);
      newDataCountRef.current += 1;
      logEvent("New data received", { eventId: newData.id, arrivalTime });
    });

    newSocket.on("error", (err: unknown) => {
      if (err instanceof Error) {
        console.error("Socket error:", err);
        setError(err.message || "Socket error");
      } else {
        setError("Socket error");
      }
    });

    return () => {
      newSocket.disconnect();
      setSocket(null);
    };
  }, [isLive, domain, logEvent]);

  useEffect(() => {
    if (!isLive && data.length === 0) {
      refetch();
    }
  }, [isLive, data.length, refetch]);

  useEffect(() => {
    const interval = setInterval(() => {
      logEvent("Data arrival frequency", {
        count: newDataCountRef.current,
        period: "1 minute",
      });
      newDataCountRef.current = 0;
    }, 60000);
    return () => clearInterval(interval);
  }, [logEvent]);

  return (
    <DataContext.Provider
      value={{
        data,
        loading,
        error,
        isLive,
        setIsLive,
        refetch,
        lastUpdateArrivalTime,
        updateEvent,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextProps => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};