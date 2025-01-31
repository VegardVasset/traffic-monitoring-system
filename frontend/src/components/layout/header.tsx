"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="bg-gray-900 text-white p-4 flex flex-col md:flex-row justify-center gap-6 border-b border-gray-700">
      <NavLink
        href="/ferry"
        label="🚢 Ferry Counting"
        active={pathname === "/ferry"}
      />
      <NavLink
        href="/vehicles"
        label="🚗 Vehicle Passing"
        active={pathname === "/vehicles"}
      />
      <NavLink
        href="/tires"
        label="🛞 Tire Scanning"
        active={pathname === "/tires"}
      />
    </header>
  );
}

// Add TypeScript Interface for Props
interface NavLinkProps {
  href: string;
  label: string;
  active: boolean;
}

function NavLink({ href, label, active }: NavLinkProps) {
  return (
    <Link href={href}>
      <span
        className={`px-4 py-2 rounded ${
          active ? "bg-blue-600" : "hover:bg-gray-700"
        }`}
      >
        {label}
      </span>
    </Link>
  );
}
