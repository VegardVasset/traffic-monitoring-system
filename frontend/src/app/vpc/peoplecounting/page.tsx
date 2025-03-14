"use client";

import React from "react";
import { DataProvider } from "@/context/DataContext";
import PeopleCountTemplate from "@/components/shared/pageTemplates/peopleCountTemplate";

export default function PassengerCountPage() {
  const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/vpc`;
  return (
    <DataProvider apiUrl={apiUrl} domain="vpc">
      <PeopleCountTemplate/>
    </DataProvider>
  );
}
