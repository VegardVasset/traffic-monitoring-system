// app/tires/layout.tsx
import DomainLayout, { NavItem } from "@/components/shared/domainLayout";
import { ReactNode } from "react";

const navItems: NavItem[] = [
  { label: "Overview", href: "/tires/overview" },
  { label: "Events", href: "/tires/events" },
  // ...other tabs
];

export default function TiresLayout({ children }: { children: ReactNode }) {
  return (
    <DomainLayout title="Tire Scanner" navItems={navItems}>
      {children}
    </DomainLayout>
  );
}
