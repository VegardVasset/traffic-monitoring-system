import { faker } from "@faker-js/faker";
import { MockRecord } from "../types";

// Helper to generate random timestamps over the last year
function getRandomTimestamp(): string {
  const start = new Date();
  start.setFullYear(start.getFullYear() - 1); 
  const end = new Date();
  return faker.date.between({ from: start, to: end }).toISOString();
}

// Function to add a random delay to mimic real-world delays
export function getReceptionTime(creationTime: string): string {
  const creationDate = new Date(creationTime);
  const delaySeconds = faker.number.int({ min: 2, max: 10 }); 
  creationDate.setSeconds(creationDate.getSeconds() + delaySeconds);
  return creationDate.toISOString();
}

// Function to generate a random event type
function getRandomEventType(): "lanepassing" | "count" | "none" {
  const types: Array<"lanepassing" | "count" | "none"> = ["lanepassing", "count", "none"];
  return types[Math.floor(Math.random() * types.length)];
}

// Function to generate mock data
export function generateMockData(
  entityType: string, // ferry, tire, or vehicle
  count: number,
  fixedTimes?: { creationTime: string; receptionTime: string }
): MockRecord[] {
  const mockData: MockRecord[] = [];
  for (let i = 0; i < count; i++) {
    const creationTime = fixedTimes?.creationTime || getRandomTimestamp();
    const receptionTime = fixedTimes?.receptionTime || getReceptionTime(creationTime);

    mockData.push({
      id: i + 1,
      creationTime,
      receptionTime,
      eventType: getRandomEventType(), 
      laneId: `Lane_${faker.number.int({ min: 1, max: 5 })}`,
      edgeId: `Edge_${faker.number.int({ min: 1, max: 3 })}`,
      imageUrl: faker.image.url({ width: 640, height: 480 }),
      confidenceScore: parseFloat(faker.number.float({ min: 0.5, max: 1 }).toFixed(2)),
      corrected: faker.datatype.boolean(),
    });
  }
  return mockData;
}
