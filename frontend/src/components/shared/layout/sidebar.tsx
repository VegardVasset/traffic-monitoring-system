"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

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

  // Mini sidebar (desktop only, shown when overlay is closed)
  function MiniSidebar() {
    if (open) return null;

    return (
      <div
        className={cn(
          "hidden md:flex fixed top-0 left-0 h-full w-16 bg-gray-800 text-white flex-col items-center py-4 z-50 shadow-md border-r border-gray-700"
        )}
      >
        <div className="flex flex-col items-center space-y-5">
          <button
            onClick={onToggle}
            className="p-2 rounded hover:bg-gray-700 focus:outline-none"
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

          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link key={item.id} href={item.href}>
                <div
                  className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-md cursor-pointer transition-colors",
                    active ? "bg-blue-600 text-white" : "hover:bg-gray-700 text-white"
                  )}
                >
                  {item.icon ? item.icon : <span>{item.label[0]}</span>}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    );
  }

  // Overlay sidebar (for mobile or expanded desktop view)
  function OverlaySidebar() {
    return (
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

            <motion.div
              className="relative h-full bg-gray-800 text-white shadow-md border-r border-gray-700 p-4"
              initial={{ width: "4rem" }}
              animate={{ width: "16rem" }}
              exit={{ width: "4rem" }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
            >
              {/* Brand header */}
              <div className="flex items-center justify-between mb-6">
                <Link href="/" onClick={onClose} className="flex items-center gap-2 group">
                  <Image
                    src="/CH-mascot.png"
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

              {/* Full navigation items */}
              <nav className="flex flex-col space-y-2">
                {navItems.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <Link key={item.id} href={item.href} onClick={onClose}>
                      <div
                        className={cn(
                          "flex items-center gap-2 py-2 px-2 rounded cursor-pointer transition-colors",
                          active ? "bg-blue-600 text-white" : "hover:bg-gray-700 text-white"
                        )}
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
    );
  }

  return (
    <>
      <MiniSidebar />
      <OverlaySidebar />
    </>
  );
}
