// src/config/domainConfig.ts

import { NavItem } from "@/components/layout/sidebar";
import { CameraIcon, ChartBarSquareIcon, TruckIcon } from "@heroicons/react/24/outline";

import  {GiCarWheel} from "react-icons/gi";
import { GrGroup } from "react-icons/gr";
import {SlSpeedometer} from "react-icons/sl";

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
        id: "overview",
        label: "Overview",
        href: "/dts/overview",
        icon: React.createElement(ChartBarSquareIcon, { className: "w-6 h-6" }),
      },
      {
        id: "passings",
        label: "Passings",
        href: "/dts/passings",
        icon: React.createElement(TruckIcon, { className: "w-6 h-6" }),
      },
      {
        id: "cameras",
        label: "Cameras",
        href: "/dts/cameras",
        icon: React.createElement(CameraIcon, { className: "w-6 h-6" }),
      },
      {
        id: "speedanalysis",
        label: "Speed Analysis",
        href: "/dts/speedanalysis",
        icon: React.createElement(SlSpeedometer, { className: "w-6 h-6" }),
      }
    ],
  },
  vpc: {
    title: "Vehicle Passenger Counter",
    navItems: [
      {
        id: "overview",
        label: "Overview",
        href: "/vpc/overview",
        icon: React.createElement(ChartBarSquareIcon, { className: "w-6 h-6" }),
      },
      {
        id: "passings",
        label: "Passings",
        href: "/vpc/passings",
        icon: React.createElement(TruckIcon, { className: "w-6 h-6" }),
      },
      {
        id: "cameras",
        label: "Cameras",
        href: "/vpc/cameras",
        icon: React.createElement(CameraIcon, { className: "w-6 h-6" }),
      },
      {
        id: "passengerCount",
        label: "People Counting",
        href: "/vpc/peoplecounting",
        icon: React.createElement(GrGroup, { className: "w-6 h-6" }),
      }
    ],
  },
  tires: {
    title: "Tire Scanner",
    navItems: [
      {
        id: "overview",
        label: "Overview",
        href: "/tires/overview",
        icon: React.createElement(ChartBarSquareIcon, { className: "w-6 h-6" }),
      },
      {
        id: "passings",
        label: "Passings",
        href: "/tires/passings",
        icon: React.createElement(TruckIcon, { className: "w-6 h-6" }),
      },
      {
        id: "cameras",
        label: "Cameras",
        href: "/tires/cameras",
        icon: React.createElement(CameraIcon, { className: "w-6 h-6" }),
      },
      {
        id: "tireanalysis",
        label: "Tire Analysis",
        href: "/tires/tireanalysis",
        icon: React.createElement(GiCarWheel, { className: "w-6 h-6" }),
      },
    ],
  },
};
