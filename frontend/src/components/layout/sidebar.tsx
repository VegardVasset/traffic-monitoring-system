"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

// Unified NavItem interface now includes id.
export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon?: React.ReactNode;
}

interface SidebarProps {
  navItems: NavItem[];
  open: boolean;       // whether the overlay sidebar is open
  onClose: () => void; // function to close the overlay
  onToggle: () => void; // function to open the overlay
}

export default function Sidebar({ navItems, open, onClose, onToggle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* MINI SIDEBAR (desktop only, visible when overlay is closed) */}
      <div
        className={`
          hidden md:flex
          fixed top-0 left-0
          h-full
          w-16
          /* Dark gray background, white text */
          bg-gray-800 text-white
          flex-col items-center
          py-4 z-50
          shadow-md border-r border-gray-700
          ${open ? "hidden" : "flex"}
        `}
      >
        {/* HAMBURGER to toggle the overlay (desktop only) */}
        <button
          onClick={onToggle}
          className="p-2 mb-4 rounded hover:bg-gray-700 focus:outline-none"
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

        {/* Mini icons for each nav item */}
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link key={item.id} href={item.href}>
              <div
                className={`
                  flex items-center justify-center
                  w-10 h-10
                  rounded-md cursor-pointer transition-colors
                  ${
                    active
                      ? "bg-blue-600 text-white"
                      : "hover:bg-gray-700 text-white"
                  }
                `}
              >
                {item.icon ? item.icon : <span>{item.label[0]}</span>}
              </div>
            </Link>
          );
        })}
      </div>

      {/* OVERLAY SIDEBAR (for mobile OR expanded on desktop) */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 flex"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          >
            {/* Dark backdrop */}
            <div className="absolute inset-0 bg-black bg-opacity-50" />

            {/* Slide-out expanded sidebar */}
            <motion.div
              className="relative h-full bg-gray-800 text-white shadow-md border-r border-gray-700 p-4"
              initial={{ width: "4rem" }}
              animate={{ width: "16rem" }}
              exit={{ width: "4rem" }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
            >
              {/* Optional brand or home link at the top */}
              <div className="flex items-center justify-between mb-6">
                <Link href="/" onClick={onClose} className="flex items-center gap-2 group">
                  <Image
                    src="/CH_LOGO_MASCOT_thicker.png"
                    alt="Mascot Logo"
                    width={48}
                    height={48}
                    className="transition-transform group-hover:scale-105"
                  />
                  <motion.span
                    initial={{ opacity: 0, display: "none" }}
                    animate={{ opacity: 1, display: "block" }}
                    transition={{ delay: 0.2, duration: 0.2 }}
                    className="font-semibold text-lg"
                  >
                    Home
                  </motion.span>
                </Link>

                {/* Close button for overlay */}
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
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Full nav items in the expanded overlay */}
              <nav className="flex flex-col space-y-2">
                {navItems.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <Link key={item.id} href={item.href} onClick={onClose}>
                      <div
                        className={`
                          flex items-center gap-2 py-2 px-2 rounded cursor-pointer transition-colors
                          ${
                            active
                              ? "bg-blue-600 text-white"
                              : "hover:bg-gray-700 text-white"
                          }
                        `}
                      >
                        <div className="w-10 h-10 flex items-center justify-center">
                          {item.icon ? item.icon : <span>{item.label[0]}</span>}
                        </div>
                        <motion.span
                          initial={{ opacity: 0, display: "none" }}
                          animate={{ opacity: 1, display: "inline" }}
                          transition={{ delay: 0.2, duration: 0.2 }}
                          className="font-medium"
                        >
                          {item.label}
                        </motion.span>
                      </div>
                    </Link>
                  );
                })}
              </nav>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
