import { useEffect, useRef } from "react";

interface UseLiveLatencyLoggerProps {
  lastUpdateArrivalTime: number | null;
  filteredDataLength: number;
  logEvent: (eventName: string, params: Record<string, unknown>) => void;
}

export function useLiveLatencyLogger({ lastUpdateArrivalTime, filteredDataLength, logEvent }: UseLiveLatencyLoggerProps) {
  const lastLoggedArrivalRef = useRef<number | null>(null);
  
  useEffect(() => {
    if (lastUpdateArrivalTime && lastUpdateArrivalTime !== lastLoggedArrivalRef.current) {
      const now = performance.now();
      const latency = now - lastUpdateArrivalTime;
      logEvent("Live mode latency", {
        latency,
        dataLength: filteredDataLength,
      });
      console.log(`Live mode latency: ${latency.toFixed(2)} ms`);
      lastLoggedArrivalRef.current = lastUpdateArrivalTime;
    }
  }, [lastUpdateArrivalTime, filteredDataLength, logEvent]);
}
