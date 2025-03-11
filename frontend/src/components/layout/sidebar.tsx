"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

export interface NavItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
}

interface SidebarProps {
  navItems: NavItem[];
  open: boolean; // expanded overlay open?
  onOpen: () => void; // open overlay
  onClose: () => void; // close overlay
  miniBarWidth?: number; // e.g. 16 => w-16 => 64px
}

export default function Sidebar({
  navItems,
  open,
  onOpen,
  onClose,
  miniBarWidth = 16,
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* MINI SIDEBAR (desktop) */}
      <div
        className={`
          hidden md:flex
          fixed top-16 left-0 h-[calc(100vh-4rem)]
          w-${miniBarWidth}
          bg-white text-gray-800
          flex-col items-center
          py-4 z-40
          shadow-md border-r border-gray-200
        `}
      >
        {/* 
          Removed the expand button here to avoid double hamburger icon.
          Now the user can open the overlay from the header hamburger 
          even on desktop.
        */}

        {/* Domain items in mini form */}
        <div className="mt-6 flex flex-col space-y-4">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={`
                    p-2 rounded cursor-pointer transition-colors
                    ${
                      active
                        ? "bg-blue-600 text-white"
                        : "hover:bg-gray-100 text-gray-800"
                    }
                  `}
                >
                  {item.icon ? item.icon : <span>{item.label[0]}</span>}
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* OVERLAY (mobile or expanded on desktop) */}
      {open && (
        <div
          className="fixed inset-0 z-50"
          onClick={onClose} // close if user clicks outside
        >
          {/* Dark backdrop */}
          <div className="absolute inset-0 bg-black bg-opacity-50" />

          {/* Sidebar overlay panel */}
          <div
            className="
              absolute top-0 left-0 h-full w-64 bg-white text-gray-800
              shadow-md border-r border-gray-200 p-4
            "
            onClick={(e) => e.stopPropagation()} // prevent close on inside click
          >
            {/* Example header area: Large icon + close button */}
            <div className="flex items-center justify-between mb-6">
              <Link href="/" className="flex items-center gap-2 group">
                <Image
                  src="/CH_LOGO_MASCOT_thicker.png"
                  alt="Mascot Logo"
                  width={48}
                  height={48}
                  className="transition-transform group-hover:scale-105"
                />
                <span className="font-semibold text-lg">Home</span>
              </Link>
              <button
                onClick={onClose}
                className="p-2 rounded hover:bg-gray-100 focus:outline-none"
                aria-label="Close domain sidebar"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Domain nav items */}
            <nav className="flex flex-col gap-2">
              {navItems.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose} // close overlay on link click
                  >
                    <span
                      className={`
                        flex items-center gap-2 py-2 px-2 rounded
                        cursor-pointer transition-colors
                        ${
                          active
                            ? "bg-blue-600 text-white"
                            : "hover:bg-gray-100 text-gray-800"
                        }
                      `}
                    >
                      {item.icon && (
                        <span className="w-5 h-5">{item.icon}</span>
                      )}
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
