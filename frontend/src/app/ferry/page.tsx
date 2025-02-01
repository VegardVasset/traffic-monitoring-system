import EventTable from "@/components/shared/eventTable";

export default function FerryPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">🚢 Ferry Counting</h1>
      <EventTable domain="ferry" />
    </div>
  );
}
