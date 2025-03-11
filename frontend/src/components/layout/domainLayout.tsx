"use client";

import React, { useState, ReactNode } from "react";
import Header from "@/components/layout/header";
import Sidebar, { NavItem } from "@/components/layout/sidebar";

interface DomainLayoutProps {
  // Domain-specific nav items, e.g. Overview, Passings, Cameras
  navItems: NavItem[];
  children: ReactNode;
}

export default function DomainLayout({ navItems, children }: DomainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="relative min-h-screen">
      {/* 1) Header with top-level nav (Ferry, DTS, Tires) + hamburger */}
      <Header onOpenSidebar={() => setSidebarOpen(true)} />

      {/* 2) Domain sidebar: mini on desktop, slide-out overlay if sidebarOpen */}
      <Sidebar
        navItems={navItems}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        miniBarWidth={16} // => w-16 => 64px
      />

      {/* 3) Main content offset:
          - pt-16 for the fixed header
          - md:pl-16 for the mini sidebar on desktop */}
      <main className="pt-16 md:pl-16">
        {children}
      </main>
    </div>
  );
}
