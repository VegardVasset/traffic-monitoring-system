"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

interface HeaderProps {
  onOpenSidebar?: () => void; // opens the domain sidebar overlay
}

export default function Header({ onOpenSidebar }: HeaderProps) {
  // Hard-coded top-level nav
  const topLevelNav = [
    { label: "Ferry Counter", href: "/ferry" },
    { label: "Detailed Traffic Statistics", href: "/dts" },
    { label: "Tire Scanner", href: "/tires" },
  ];

  return (
    <header
      className={cn(
        "fixed top-0 left-0 w-full h-16 z-50 shadow-sm border-b border-gray-200",
        "bg-white text-gray-800"
      )}
    >
      <div className="flex items-center justify-between px-4 h-full">
        {/* Hamburger (visible at all sizes) */}
        <button
          onClick={onOpenSidebar}
          className="p-2 rounded hover:bg-gray-100 focus:outline-none"
          aria-label="Open domain sidebar"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              d="M3.75 5.25h16.5m-16.5 6h16.5m-16.5 6h16.5" 
            />
          </svg>
        </button>

        {/* Top-level nav (Ferry, DTS, Tires) on all screen sizes */}
        <nav className="flex items-center space-x-4">
          {topLevelNav.map((item) => (
            <Link key={item.href} href={item.href}>
              <span
                className={cn(
                  "px-3 py-2 rounded-md font-medium text-gray-700 hover:bg-gray-200 hover:text-gray-900 transition-colors"
                )}
              >
                {item.label}
              </span>
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
