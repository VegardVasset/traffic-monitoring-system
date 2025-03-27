"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

interface HeaderProps {
  onToggleSidebar?: () => void;
  hideHamburger?: boolean; 
}

const topLevelNav = [
  { id: "vpc", label: "Vehicle Passenger Counter", href: "/vpc" },
  { id: "dts", label: "Detailed Traffic Statistics", href: "/dts" },
  { id: "tires", label: "Tire Scanner", href: "/tires" },
];

export default function Header({ onToggleSidebar, hideHamburger }: HeaderProps) {
  const pathname = usePathname();

  const renderHamburger = () => {
    if (hideHamburger) return null;

    return (
      <div className="flex items-center">
        <button
          onClick={onToggleSidebar}
          className="block md:hidden p-2 rounded hover:bg-gray-700 focus:outline-none"
          aria-label="Toggle sidebar"
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
        <div className="block md:hidden mx-3 h-6 border-l border-gray-600" />
      </div>
    );
  };

  const renderNavItems = () => (
    <nav
      className={cn(
        "flex flex-nowrap items-center justify-center",
        "space-x-2 md:space-x-6 text-sm md:text-base"
      )}
    >
      {topLevelNav.map((item) => {
        const isActive = pathname.startsWith(item.href);
        return (
          <Link key={item.id} href={item.href}>
            <span
              className={cn(
                "block rounded-md font-medium transition-colors text-center",
                "px-2 py-1 md:px-4 md:py-2 whitespace-normal break-words",
                isActive ? "bg-blue-600 text-white" : "text-white hover:bg-gray-700"
              )}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 h-16 z-40",
        "shadow-sm border-b border-gray-700 bg-gray-800 text-white"
      )}
    >
      <div className="flex items-center px-4 h-full min-w-0">
        {renderHamburger()}
        <div className="flex-1 flex justify-center">
          {renderNavItems()}
        </div>
      </div>
    </header>
  );
}
