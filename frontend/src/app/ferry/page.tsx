import EventTable from "@/components/shared/eventTable";

async function getInitialFerryData() {
  try {
    const res = await fetch("http://localhost:4000/api/ferry", { cache: "no-store" });

    if (!res.ok) {
      throw new Error(`Failed to fetch data: ${res.statusText}`);
    }

    return await res.json();
  } catch (error) {
    console.error("Error fetching ferry data:", error);
    return []; // Return empty array to prevent UI crash
  }
}

export default async function FerryPage() {
  const initialData = await getInitialFerryData();

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">🚢 Ferry Counting</h1>
      
      {/* Event table stays separate */}
      <EventTable domain="ferry" />
    </div>
  );
}
