import EventTable from "@/components/shared/eventTable";

async function getInitialTireData() {
  try {
    const res = await fetch("http://localhost:4000/api/tires", { cache: "no-store" });

    if (!res.ok) {
      throw new Error(`Failed to fetch data: ${res.statusText}`);
    }

    return await res.json();
  } catch (error) {
    console.error("Error fetching tire data:", error);
    return []; // Return empty array to prevent UI crash
  }
}

export default async function TiresPage() {
  const initialData = await getInitialTireData();

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">🛞 Tire Scanning</h1>
      
      {/* Event table stays separate */}
      <EventTable domain="tires" />
    </div>
  );
}