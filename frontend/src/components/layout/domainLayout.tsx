"use client";

import React, { useState, ReactNode } from "react";
import Sidebar, { NavItem } from "@/components/layout/sidebar";
import Header from "@/components/layout/header";

interface DomainLayoutProps {
  navItems: NavItem[];
  children: ReactNode;
}

export default function DomainLayout({ navItems, children }: DomainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // A single toggle function for both mobile & desktop
  function toggleSidebar() {
    setSidebarOpen((prev) => !prev);
  }

  return (
    <div className="relative min-h-screen">
      {/* SIDEBAR (mini on desktop, overlay on mobile or when expanded) */}
      <Sidebar
        navItems={navItems}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onToggle={toggleSidebar}
      />

      {/* HEADER (with mobile-only hamburger) */}
      <Header onToggleSidebar={toggleSidebar} />

      {/* MAIN CONTENT: 
          Pushed down by 64px header,
          on desktop also offset left by 64px for the mini sidebar. */}
      <main className="pt-16 md:ml-16">
        {children}
      </main>
    </div>
  );
}
