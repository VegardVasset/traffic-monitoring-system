import { faker } from "@faker-js/faker";


function getRandomTimestamp(): string {
  const start = new Date();
  start.setFullYear(start.getFullYear() - 1); 
  const end = new Date();
  const timestamp = faker.date.between({ from: start, to: end }).toISOString();
  return timestamp;
}

export function generateMockData(eventType: string, count: number) {
  const mockData = [];
  for (let i = 0; i < count; i++) {
    mockData.push({
      id: i + 1,
      creationTime: getRandomTimestamp(),
      receptionTime: getRandomTimestamp(),
      eventType,
      laneId: `Lane_${faker.number.int({ min: 1, max: 5 })}`,
      edgeId: `Edge_${faker.number.int({ min: 1, max: 3 })}`,
      imageUrl: faker.image.url({ width: 640, height: 480 }),
      confidenceScore: parseFloat(faker.number.float({ min: 0.5, max: 1 }).toFixed(2)),
      corrected: faker.datatype.boolean(),
    });
  }
  return mockData;
}
