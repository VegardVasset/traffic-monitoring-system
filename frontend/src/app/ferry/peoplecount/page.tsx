"use client";

import React from "react";
import { DataProvider } from "@/context/DataContext";
import PeopleCountTemplate from "@/components/shared/pageTemplates/peopleCountTemplate";

export default function PassengerCountPage() {
  const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/ferry`;
  return (
    <DataProvider apiUrl={apiUrl} domain="ferry">
      <PeopleCountTemplate domainTitle="Ferry Counter"/>
    </DataProvider>
  );
}
