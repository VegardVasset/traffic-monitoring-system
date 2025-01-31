import EventTable from "@/components/shared/eventTable";

async function getInitialVehicleData() {
  try {
    const res = await fetch("http://localhost:4000/api/vehicles", { cache: "no-store" });

    if (!res.ok) {
      throw new Error(`Failed to fetch data: ${res.statusText}`);
    }

    return await res.json();
  } catch (error) {
    console.error("Error fetching vehicle data:", error);
    return []; // Return empty array to prevent UI crash
  }
}

export default async function VehiclesPage() {
  const initialData = await getInitialVehicleData();

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">🚗 Vehicle Passing</h1>
      
      {/* Event table stays separate */}
      <EventTable domain="vehicles" />
    </div>
  );
}