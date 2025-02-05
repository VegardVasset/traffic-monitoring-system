import DomainLayout, { NavItem } from "@/components/shared/domainLayout";
import { ReactNode } from "react";

const navItems: NavItem[] = [
  { label: "Overview", href: "/dts/overview" },
  { label: "Events", href: "/dts/events" },
  // ...other tabs
];

export default function DtsLayout({ children }: { children: ReactNode }) {
  return (
    <DomainLayout title="Detailed Traffic Statistics" navItems={navItems}>
      {children}
    </DomainLayout>
  );
}
