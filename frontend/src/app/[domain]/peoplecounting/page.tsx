"use client";

import React from "react";
import { useParams } from "next/navigation";
import { DataProvider } from "@/context/DataContext";
import PeopleCountTemplate from "@/components/vpc/pageTemplates/PeopleCountTemplate";

export default function PassengerCountPage() {
    const { domain } = useParams() as { domain: string };
  

   if (domain !== "vpc") {
    return <p>People Counter is not available for domain &quot;{domain}&quot;.</p>;
  }

  const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/${domain}`;
  return (
    <DataProvider apiUrl={apiUrl} domain={domain}>
      <PeopleCountTemplate/>
    </DataProvider>
  );
}

