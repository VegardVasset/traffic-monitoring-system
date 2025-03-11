"use client";

import { createContext, useContext, useState } from "react";

export interface AnalyticsEvent {
  message: string;
  timestamp: number;
  data?: any;
}

interface AnalyticsContextProps {
  events: AnalyticsEvent[];
  logEvent: (message: string, data?: any) => void;
}

const AnalyticsContext = createContext<AnalyticsContextProps | undefined>(undefined);

export default function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);

  const logEvent = (message: string, data?: any) => {
    const newEvent: AnalyticsEvent = {
      message,
      timestamp: Date.now(),
      data,
    };
    setEvents((prev) => [...prev, newEvent]);
    console.log("[Analytics]", newEvent);
  };

  return (
    <AnalyticsContext.Provider value={{ events, logEvent }}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalytics(): AnalyticsContextProps {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error("useAnalytics must be used within an AnalyticsProvider");
  }
  return context;
}
