import { ReactNode } from "react";
import DomainLayout from "@/components/layout/domainLayout";
import { domainConfigs } from "@/config/domainConfig";

// app/[monitoring]/layout.tsx
export default async function MonitoringLayout({
    children,
    params,
  }: {
    children: React.ReactNode;
    params: { monitoring: string };
  }) {
    // In an Edge environment, params is async
    const { monitoring } = await params;
    const config = domainConfigs[monitoring] || domainConfigs.default;
  
    return (
      <DomainLayout navItems={config.navItems}>
        {children}
      </DomainLayout>
    );
  }