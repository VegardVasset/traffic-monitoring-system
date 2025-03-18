"use client";

import React from "react";
import { useParams } from "next/navigation";
import { DataProvider } from "@/context/DataContext";
import PeopleCountTemplate from "@/components/shared/pageTemplates/peopleCountTemplate";

export default function PassengerCountPage() {
    const { monitoring } = useParams() as { monitoring: string };
  

   // If you ONLY want to allow `/tires/analysis`:
   if (monitoring !== "vpc") {
    return <p>People Counter is not available for domain "{monitoring}".</p>;
  }

  const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/${monitoring}`;
  return (
    <DataProvider apiUrl={apiUrl} domain={monitoring}>
      <PeopleCountTemplate/>
    </DataProvider>
  );
}

