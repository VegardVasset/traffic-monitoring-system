// app/layout.tsx
import Header from "@/components/layout/header";
import type { Metadata } from "next";
import "./globals.css";
import ClientProviders from "./clientProviders";

export const metadata: Metadata = {
  title: "Traffic Monitoring System",
  description: "Real-time monitoring for ferries, vehicles, and tire scanning.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-100 text-gray-900">
        <ClientProviders>
          <Header hideHamburger /> {/* Header appears on every page */}
          <main className="p-0">{children}</main>
        </ClientProviders>
      </body>
    </html>
  );
}
