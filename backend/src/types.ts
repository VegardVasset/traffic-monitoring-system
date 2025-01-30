export interface MockRecord {
    id: number;
    creationTime: string;
    receptionTime: string;
    eventType: string;
    laneId: string;
    edgeId: string;
    imageUrl: string;
    confidenceScore: number;
    corrected: boolean;
  }
  