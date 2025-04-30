// src/context/AnalyticsContext.tsx
"use client";

import { createContext, useContext, useRef, useState, useEffect } from "react";

export interface AnalyticsEvent {
  message: string;
  timestamp: number;
  data?: unknown;
}

interface AnalyticsContextProps {
  events: AnalyticsEvent[];
  logEvent: (message: string, data?: unknown) => void;
}

const AnalyticsContext = createContext<AnalyticsContextProps | undefined>(undefined);

export default function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const eventsRef = useRef<AnalyticsEvent[]>([]);
  const [, setVersion] = useState(0);
  const flushTimeoutRef = useRef<number | null>(null);
  const seenVitalsRef = useRef<Set<string>>(new Set());

  const flushEvents = () => {
    setVersion(v => v + 1);
    flushTimeoutRef.current = null;
  };

  const logEvent = (message: string, data?: unknown) => {
    // Dedupe Web Vitals by their `name` field
    if (message === "Web Vitals" && typeof data === "object" && data !== null) {
      const candidate = data as Record<string, unknown>;
      const name = candidate.name;
      if (typeof name === "string") {
        if (seenVitalsRef.current.has(name)) {
          return;
        }
        seenVitalsRef.current.add(name);
      }
    }

    eventsRef.current.push({ message, timestamp: Date.now(), data });
    console.log("[Analytics]", { message, data });

    if (flushTimeoutRef.current === null) {
      flushTimeoutRef.current = window.setTimeout(flushEvents, 1000);
    }
  };

  useEffect(() => {
    return () => {
      if (flushTimeoutRef.current !== null) {
        clearTimeout(flushTimeoutRef.current);
      }
    };
  }, []);

  const events = eventsRef.current;

  return (
    <AnalyticsContext.Provider value={{ events, logEvent }}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalytics(): AnalyticsContextProps {
  const ctx = useContext(AnalyticsContext);
  if (!ctx) {
    throw new Error("useAnalytics must be used within an AnalyticsProvider");
  }
  return ctx;
}
