import Header from "@/components/shared/layout/Header";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Traffic Monitoring System",
  description: "Real-time monitoring for ferries, vehicles, and tire scanning.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-100 text-gray-900">
          <Header hideHamburger /> 
          <main className="p-0">{children}</main>
      </body>
    </html>
  );
}
