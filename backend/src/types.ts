export interface MockRecord {
  id: number;
  creationTime: string;
  receptionTime: string;
  eventType: "lanepassing" | "count" | "none";
  laneId: string;
  edgeId: string;
  imageUrl: string;
  confidenceScore: number;
  corrected: boolean;
}
