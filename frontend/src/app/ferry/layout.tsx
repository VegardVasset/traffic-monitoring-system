// app/ferry/layout.tsx
import DomainLayout, { NavItem } from "@/components/shared/domainLayout";
import { ReactNode } from "react";

const navItems: NavItem[] = [
  { label: "Overview", href: "/ferry/overview" },
  { label: "Events", href: "/ferry/events" },
  { label: "Statistics", href: "/ferry/statistics" },
  { label: "Reports", href: "/ferry/reports" },
];

export default function FerryLayout({ children }: { children: ReactNode }) {
  return (
    <DomainLayout title="Ferry Counter" navItems={navItems}>
      {children}
    </DomainLayout>
  );
}
