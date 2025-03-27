"use client";

import React, { useState, ReactNode } from "react";
import Sidebar, { NavItem } from "@/components/shared/layout/Sidebar";
import Header from "@/components/shared/layout/Header";

interface DomainLayoutProps {
  navItems: NavItem[];
  children: ReactNode;
}

export default function DomainLayout({ navItems, children }: DomainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function toggleSidebar() {
    setSidebarOpen((prev) => !prev);
  }

  return (
    <div className="relative min-h-screen">
      <Sidebar
        navItems={navItems}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onToggle={toggleSidebar}
      />

      <Header onToggleSidebar={toggleSidebar} />


      <main className="pt-16 md:ml-16">
        {children}
      </main>
    </div>
  );
}
