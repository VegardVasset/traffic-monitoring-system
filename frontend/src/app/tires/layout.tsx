// app/tires/layout.tsx
import DomainLayout from "@/components/layout/domainLayout";
import { ReactNode } from "react";
import { domainConfigs } from "@/config/domainConfig";

export default function TiresLayout({ children }: { children: ReactNode }) {
  const config = domainConfigs.tires;
  return (
    <DomainLayout title={config.title} navItems={config.navItems}>
      {children}
    </DomainLayout>
  );
}
