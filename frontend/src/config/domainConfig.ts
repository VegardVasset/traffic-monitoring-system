// src/config/domainConfig.ts
import { NavItem } from "@/components/shared/domainLayout";

export interface DomainConfig {
  title: string;
  navItems: NavItem[];
}

export const domainConfigs: Record<string, DomainConfig> = {
  dts: {
    title: "Detailed Traffic Statistics",
    navItems: [
      { label: "Overview", href: "/dts/overview" },
      { label: "Passings", href: "/dts/events" },
      // ...other tabs if needed
    ],
  },
  ferry: {
    title: "Ferry Counter",
    navItems: [
      { label: "Overview", href: "/ferry/overview" },
      { label: "Passings", href: "/ferry/events" },
    ],
  },
  tires: {
    title: "Tire Scanner",
    navItems: [
      { label: "Overview", href: "/tires/overview" },
      { label: "Passings", href: "/tires/events" },
    ],
  },
};
