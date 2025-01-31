export const mockData = {
    ferry: [
      {
        id: 1,
        creationTime: "2025-01-30T08:30:15Z",
        receptionTime: "2025-01-30T08:30:45Z",
        eventType: "ferry_counting",
        laneId: "Lane_1",
        edgeId: "Edge_1",
        imageUrl: "https://mock-storage.com/ferry_001.jpg",
        confidenceScore: 0.92,
        corrected: false,
      },
    ],
    tire: [
      {
        id: 2,
        creationTime: "2025-01-30T08:32:10Z",
        receptionTime: "2025-01-30T08:32:40Z",
        eventType: "tire_inspection",
        laneId: "Lane_2",
        edgeId: "Edge_2",
        imageUrl: "https://mock-storage.com/tire_001.jpg",
        confidenceScore: 0.88,
        corrected: true,
      },
    ],
    vehicle: [
      {
        id: 3,
        creationTime: "2025-01-30T08:35:22Z",
        receptionTime: "2025-01-30T08:35:50Z",
        eventType: "vehicle_passing",
        laneId: "Lane_3",
        edgeId: "Edge_3",
        imageUrl: "https://mock-storage.com/vehicle_001.jpg",
        confidenceScore: 0.97,
        corrected: false,
      },
    ],
  };
  