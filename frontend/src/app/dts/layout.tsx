// app/dts/layout.tsx
import DomainLayout from "@/components/layout/domainLayout";
import { ReactNode } from "react";
import { domainConfigs } from "@/config/domainConfig";

export default function DtsLayout({ children }: { children: ReactNode }) {
  const config = domainConfigs.dts;
  return (
    <DomainLayout title={config.title} navItems={config.navItems}>
      {children}
    </DomainLayout>
  );
}
