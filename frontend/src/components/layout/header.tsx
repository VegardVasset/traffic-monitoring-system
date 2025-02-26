"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white shadow-lg">
      <div className="container mx-auto px-4 py-3 flex items-center justify-center">
        {/* Centered Navigation Links */}
        <nav className="flex items-center space-x-6">
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
        className={`px-4 py-2 rounded transition-colors ${
          active
            ? "bg-blue-600 text-white font-semibold"
            : "hover:bg-white/10"
        }`}
      >
        {label}
      </span>
    </Link>
  );
}
