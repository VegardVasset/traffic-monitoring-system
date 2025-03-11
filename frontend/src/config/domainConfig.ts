// src/config/domainConfig.ts

import { NavItem } from "@/components/layout/sidebar";
import { CameraIcon, ChartBarSquareIcon, TruckIcon } from "@heroicons/react/24/outline";
import  {GiCarWheel} from "react-icons/gi";
import React from "react";

export interface DomainConfig {
  title: string;
  navItems: NavItem[];
}


export const domainConfigs: Record<string, DomainConfig> = {
  dts: {
    title: "Detailed Traffic Statistics",
    navItems: [
      {
        label: "Overview",
        href: "/dts/overview",
        icon: React.createElement(ChartBarSquareIcon, { className: "w-6 h-6" }),
      },
      {
        label: "Passings",
        href: "/dts/events",
        icon: React.createElement(TruckIcon, { className: "w-6 h-6" }),
      },
      {
        label: "Cameras",
        href: "/dts/cameras",
        icon: React.createElement(CameraIcon, { className: "w-6 h-6" }),
      }
    ],
  },
  ferry: {
    title: "Ferry Counter",
    navItems: [
      {
        label: "Overview",
        href: "/ferry/overview",
        icon: React.createElement(ChartBarSquareIcon, { className: "w-6 h-6" }),
      },
      {
        label: "Passings",
        href: "/ferry/events",
        icon: React.createElement(TruckIcon, { className: "w-6 h-6" }),
      },
      {
        label: "Cameras",
        href: "/ferry/cameras",
        icon: React.createElement(CameraIcon, { className: "w-6 h-6" }),
      }
    ],
  },
  tires: {
    title: "Tire Scanner",
    navItems: [
      {
        label: "Overview",
        href: "/tires/overview",
        icon: React.createElement(ChartBarSquareIcon, { className: "w-6 h-6" }),
      },
      {
        label: "Passings",
        href: "/tires/events",
        icon: React.createElement(TruckIcon, { className: "w-6 h-6" }),
      },
    ],
  },
};
