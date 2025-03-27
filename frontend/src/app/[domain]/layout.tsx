import DomainLayout from "@/components/shared/layout/DomainLayout";
import { domainConfigs } from "@/config/domainConfig";

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { domain: string };
}) {
  const { domain } = await params;
  const config = domainConfigs[domain] || domainConfigs.default;

  return (
    <DomainLayout navItems={config.navItems}>
      {children}
    </DomainLayout>
  );
}