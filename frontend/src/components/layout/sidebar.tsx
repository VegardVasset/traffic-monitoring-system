"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export interface NavItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
}

interface SidebarProps {
  navItems: NavItem[];
  open: boolean; // Is the full sidebar open?
  onOpen: () => void; // Function to open it
  onClose: () => void; // Function to close it
  miniBarWidth?: number; // Optional: override the mini-bar width (Tailwind spacing)
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
      {/* MINI SIDEBAR (always visible) */}
      <div
        className={`
          fixed top-0 left-0 h-screen
          w-${miniBarWidth}
          bg-gray-800 text-white
          flex flex-col items-center
          py-4 z-40
        `}
      >
        {/* Hamburger button to open expanded sidebar */}
        <button
          onClick={onOpen}
          className="p-2 rounded hover:bg-gray-700 focus:outline-none"
          aria-label="Open sidebar"
        >
          {/* Bars3 Icon */}
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

        {/* Mini-bar icons for each nav item */}
        <div className="mt-6 flex flex-col space-y-4">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={`p-2 rounded cursor-pointer ${
                    active ? "bg-blue-600" : "hover:bg-gray-700"
                  }`}
                >
                  {item.icon ? item.icon : <span>{item.label[0]}</span>}
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* EXPANDED SIDEBAR OVERLAY */}
      {open && (
        <div
          className="fixed inset-0 z-50"
          onClick={onClose} // close if user clicks the overlay
        >
          {/* The actual sidebar panel. Stop propagation so clicks here won't close. */}
          <div
            className="relative h-screen w-64 bg-gray-800 text-white"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 
        Flex container for everything inside the sidebar.
        We add px-4 at this level so that everything lines up horizontally.
      */}
            <div className="flex flex-col h-full px-3 py-4">
              {/* Header area: Home link + close button */}
              <div className="flex items-center justify-between mb-6">
                {/* Home Link */}
                <Link href="/" className="flex items-center gap-2 group">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6 transition-transform group-hover:scale-105"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.75 9l7.5-6 7.5 6M4.5 9.75v9.75a1.5 1.5 0 001.5 1.5h3.75m6 0h3.75a1.5 1.5 0 001.5-1.5V9.75M9.75 22.5v-6h4.5v6"
                    />
                  </svg>
                  <span className="font-semibold text-lg transition-colors group-hover:text-gray-50">
                    Home
                  </span>
                </Link>

                {/* Close button (X) */}
                <button
                  onClick={onClose}
                  className="p-2 rounded hover:bg-gray-700 focus:outline-none"
                  aria-label="Close sidebar"
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

              {/* Nav items */}
              <nav className="flex flex-col gap-2">
                {navItems.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => onClose()} // close on click
                    >
                      <span
                        className={`flex items-center gap-2 py-2 rounded cursor-pointer transition-colors ${
                          active ? "bg-blue-600" : "hover:bg-gray-700"
                        }`}
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

              {/* If you have something at the bottom, keep it aligned with px-4 as well */}
              <div className="mt-auto flex items-center justify-center">
               
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
