"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// A modern dark gradient header with a Home icon on the left
export default function Header() {
  const pathname = usePathname();

  return (
    <header className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white shadow-lg">
      {/* Center and space content with container */}
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Home Icon + Label */}
        <Link href="/" className="flex items-center gap-2 group">
          {/* Inline SVG Home Icon (Heroicons outline) */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
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

        {/* Navigation Links */}
        <nav className="flex items-center space-x-4">
          <NavLink
            href="/ferry"
            label="Ferry Counter"
            active={pathname === "/ferry"}
          />
          <NavLink
            href="/dts"
            label="Detailed Traffic Statistics"
            active={pathname === "/dts"}
          />
          <NavLink
            href="/tires"
            label="Tire Scanner"
            active={pathname === "/tires"}
          />
        </nav>
      </div>
    </header>
  );
}

// Props for each nav link
interface NavLinkProps {
  href: string;
  label: string;
  active: boolean;
}

function NavLink({ href, label, active }: NavLinkProps) {
  return (
    <Link href={href}>
      <span
        className={`px-4 py-2 rounded transition-colors ${
          active
            ? // Active link styling
              "bg-blue-600 text-white font-semibold"
            : // Hover effect for inactive links
              "hover:bg-white/10"
        }`}
      >
        {label}
      </span>
    </Link>
  );
}
