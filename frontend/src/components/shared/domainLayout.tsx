"use client";
import React, { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export interface NavItem {
  label: string;
  href: string;
}

interface DomainLayoutProps {
  title: string;
  navItems: NavItem[];
  children: ReactNode;
}

export default function DomainLayout({ title, navItems, children }: DomainLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white p-4">
        <h2 className="text-xl font-semibold mb-6">{title}</h2>
        <nav className="flex flex-col gap-2">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <span
                className={`block px-4 py-2 rounded cursor-pointer transition-colors ${
                  pathname === item.href
                    ? "bg-blue-600"
                    : "hover:bg-gray-700"
                }`}
              >
                {item.label}
              </span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 overflow-auto">{children}</main>
    </div>
  );
}
