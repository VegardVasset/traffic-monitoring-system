"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

interface HeaderProps {
  onToggleSidebar: () => void;
}

export default function Header({ onToggleSidebar }: HeaderProps) {
  const topLevelNav = [
    { label: "Ferry Counter", href: "/ferry" },
    { label: "Detailed Traffic Statistics", href: "/dts" },
    { label: "Tire Scanner", href: "/tires" },
  ];

  // Detect current path to highlight the active link
  const pathname = usePathname();

  return (
    <header
      className={cn(
        "fixed top-0 left-0 md:left-16 right-0 h-16 z-40",
        "shadow-sm border-b border-gray-700 bg-gray-800 text-white"
      )}
    >
      <div className="flex items-center px-4 h-full min-w-0">
        {/* LEFT: mobile hamburger + vertical line */}
        <div className="flex items-center">
          <button
            onClick={onToggleSidebar}
            className="block md:hidden p-2 rounded hover:bg-gray-700 focus:outline-none"
            aria-label="Toggle sidebar"
          >
            {/* Hamburger icon */}
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

          {/* Vertical line (only on mobile) */}
          <div className="block md:hidden mx-3 h-6 border-l border-gray-600" />
        </div>

        {/* CENTER: single-line nav, but each button can wrap internally */}
        <div className="flex-1 flex justify-center">
          <nav
            className={cn(
              "flex flex-nowrap items-center justify-center",
              // Responsive spacing: tighter on mobile, larger on desktop
              "space-x-2 md:space-x-6"
            )}
          >
            {topLevelNav.map((item) => {
              const isActive = pathname.startsWith(item.href);

              return (
                <Link key={item.href} href={item.href}>
                  <span
                    className={cn(
                      // Make each link a block with multi-line text
                      "block rounded-md font-medium transition-colors text-center",
                      // Responsive font + padding
                      "text-sm md:text-base px-2 py-1 md:px-4 md:py-2",
                      // Allow internal wrapping, but keep button on the same row
                      "whitespace-normal break-words",
                      // Limit the button width on mobile so text can wrap if too long
                      "max-w-[7rem] md:max-w-none",
                      // Active link or default hover style
                      isActive
                        ? "bg-blue-600 text-white"
                        : "text-white hover:bg-gray-700"
                    )}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
