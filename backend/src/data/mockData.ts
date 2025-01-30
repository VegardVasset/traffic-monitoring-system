export const mockEvents = [
    {
        id: "event1",
        creationTime: new Date().toISOString(),
        receptionTime: new Date().toISOString(),
        eventType: "vehicle_passing",
        location: {
            laneId: 1,
            edgeId: 101,
        },
    },
    {
        id: "event2",
        creationTime: new Date().toISOString(),
        receptionTime: new Date().toISOString(),
        eventType: "tire_scan",
        location: {
            laneId: 2,
            edgeId: 102,
        },
    },
];
