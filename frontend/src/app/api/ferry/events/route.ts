import { NextResponse } from "next/server";

export async function GET() {
  const mockEvents = [
    {
      id: "1",
      creationTime: new Date().toISOString(),
      receptionTime: new Date().toISOString(),
      eventType: "boarding",
      aiConfidence: 0.92,
    },
    {
      id: "2",
      creationTime: new Date(Date.now() - 60000).toISOString(),
      receptionTime: new Date(Date.now() - 30000).toISOString(),
      eventType: "departure",
      aiConfidence: 0.85,
    },
    {
      id: "3",
      creationTime: new Date(Date.now() - 120000).toISOString(),
      receptionTime: new Date(Date.now() - 90000).toISOString(),
      eventType: "arrival",
      aiConfidence: 0.78,
    },
  ];

  return NextResponse.json(mockEvents);
}
