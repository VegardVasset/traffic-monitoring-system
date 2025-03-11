"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils"; // Or your own utility for conditionally joining classes

export default function Header() {
  const pathname = usePathname();

  // If your domain pages are /dts, /ferry, /tires, etc.,
  // and each has a sidebar, we consider them "hasSidebar" pages.
  const domainRoutes = ["/dts", "/ferry", "/tires"];
  const hasSidebar = domainRoutes.some((route) => pathname.startsWith(route));

  return (
    <header
      // Condition: add ml-16 only if it's a "sidebar" route
      className={cn(
        "bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white shadow-lg",
        hasSidebar ? "ml-16" : ""
      )}
    >
      <div className="container mx-auto px-4 py-3 flex items-center justify-center">
        <nav className="flex items-center space-x-4 md:space-x-6">
          <NavLink
            href="/ferry"
            label="Ferry Counter"
            active={pathname.startsWith("/ferry")}
          />
          <NavLink
            href="/dts"
            label="Detailed Traffic Statistics"
            active={pathname.startsWith("/dts")}
          />
          <NavLink
            href="/tires"
            label="Tire Scanner"
            active={pathname.startsWith("/tires")}
          />
           <NavLink
            href="/analytics"
            label="Analytics"
            active={pathname.startsWith("/analytics")}
          />
        </nav>
      </div>
    </header>
  );
}

interface NavLinkProps {
  href: string;
  label: string;
  active: boolean;
}

function NavLink({ href, label, active }: NavLinkProps) {
  return (
    <Link href={href}>
      <span
        className={`px-0 py-0 md:px-4 md:py-2 rounded transition-colors ${
          active ? "bg-blue-600 text-white font-semibold" : "hover:bg-white/10"
        }`}
      >
        {label}
      </span>
    </Link>
  );
}
