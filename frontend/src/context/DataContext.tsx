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
}

interface DataContextProps {
  data: BaseEvent[];
  loading: boolean;
  error: string | null;
  isLive: boolean;
  setIsLive: (live: boolean) => void;
  refetch: () => void;
  lastUpdateArrivalTime: number | null;
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

  // For frequency measurement: count new data events
  const newDataCountRef = useRef<number>(0);

  /**
   * REST fetch with timing measurement
   */
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

  /**
   * Disconnect socket if live mode is turned off
   */
  useEffect(() => {
    if (!isLive && socket) {
      socket.disconnect();
      setSocket(null);
    }
  }, [isLive, socket]);

  /**
   * Connect to WebSocket when live mode is on
   */
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

      newDataCountRef.current += 1; // increment the frequency counter
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

  /**
   * If live mode is off and no data is loaded, do a REST fetch
   */
  useEffect(() => {
    if (!isLive && data.length === 0) {
      refetch();
    }
  }, [isLive, data.length, refetch]);

  /**
   * Log frequency of new data arrivals every minute
   */
  useEffect(() => {
    const interval = setInterval(() => {
      logEvent("Data arrival frequency", {
        count: newDataCountRef.current,
        period: "1 minute",
      });
      newDataCountRef.current = 0;
    }, 60000); // every 60s

    return () => clearInterval(interval);
  }, [logEvent]);

  return (
    <DataContext.Provider
      value={{ data, loading, error, isLive, setIsLive, refetch, lastUpdateArrivalTime }}
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
