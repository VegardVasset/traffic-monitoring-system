"use client";

import React, { useState, ReactNode } from "react";
import Sidebar, { NavItem } from "@/components/layout/sidebar";
import Header from "@/components/layout/header";

interface DomainLayoutProps {
  // Domain-specific nav items, e.g. Overview, Passings, Cameras
  navItems: NavItem[];
  children: ReactNode;
}

export default function DomainLayout({ navItems, children }: DomainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="relative min-h-screen">
      {/* Header with top-level nav (Ferry, DTS, Tires) and hamburger to open domain sidebar */}
      <Header onOpenSidebar={() => setSidebarOpen(true)} />

      {/* Domain sidebar (mini on desktop, overlay on mobile/expanded) */}
      <Sidebar
        navItems={navItems}
        open={sidebarOpen}
        onOpen={() => setSidebarOpen(true)}
        onClose={() => setSidebarOpen(false)}
        miniBarWidth={16} // 16 => w-16 => 64px
      />

      {/* Main content offset by header (pt-16) and sidebar (md:ml-16) */}
      <main className="pt-16 md:ml-16">{children}</main>
    </div>
  );
}
