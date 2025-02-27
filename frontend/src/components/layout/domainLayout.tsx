// components/shared/domainLayout.tsx
"use client";

import React, { useState, ReactNode } from "react";
import Sidebar, { NavItem } from "@/components/layout/sidebar";

interface DomainLayoutProps {
  navItems: NavItem[];
  children: ReactNode;
}

export default function DomainLayout({ navItems, children }: DomainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="relative min-h-screen">
      {/* Sidebar with mini-bar + overlay */}
      <Sidebar
        navItems={navItems}
        open={sidebarOpen}
        onOpen={() => setSidebarOpen(true)}
        onClose={() => setSidebarOpen(false)}
        miniBarWidth={16} // e.g., w-16
      />

      {/* Main content. Add left margin so mini-bar doesn’t overlap content. */}
      <main className="ml-16 p-6">
        {children}
      </main>
    </div>
  );
}
