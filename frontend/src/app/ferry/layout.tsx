// app/ferry/layout.tsx
import DomainLayout from "@/components/shared/domainLayout";
import { ReactNode } from "react";
import { domainConfigs } from "@/config/domainConfig";

export default function FerryLayout({ children }: { children: ReactNode }) {
  const config = domainConfigs.ferry;
  return (
    <DomainLayout title={config.title} navItems={config.navItems}>
      {children}
    </DomainLayout>
  );
}
