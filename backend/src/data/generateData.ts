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

// Function to generate a weighted realistic vehicle type
function getRandomVehicleType(): MockRecord["vehicleType"] {
  const vehicleDistribution: { type: MockRecord["vehicleType"]; weight: number }[] = [
    { type: "person transport", weight: 40 },   // Most common
    { type: "buss", weight: 15 },               // Common
    { type: "motorsykkel", weight: 10 },        // Fairly common
    { type: "lastebil lukket", weight: 8 },     // Medium
    { type: "lastebil åpen", weight: 5 },       // Less common
    { type: "lett industri", weight: 5 },       // Less common
    { type: "tilhenger", weight: 5 },           // Less common
    { type: "camping kjøretøy", weight: 4 },    // Less common
    { type: "utrykningskjøretøy", weight: 3 },  // Rare
    { type: "lastebil sylinder", weight: 3 },   // Rare
    { type: "myke trafikanter", weight: 2 },    // Very rare
    { type: "traktor", weight: 0 }              
  ];

  // Create weighted probability distribution
  const weightedList: MockRecord["vehicleType"][] = [];
  vehicleDistribution.forEach(({ type, weight }) => {
    for (let i = 0; i < weight; i++) {
      weightedList.push(type);
    }
  });

  return weightedList[Math.floor(Math.random() * weightedList.length)];
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
      vehicleType: getRandomVehicleType(),  
      laneId: `Lane_${faker.number.int({ min: 1, max: 5 })}`,
      edgeId: `Edge_${faker.number.int({ min: 1, max: 3 })}`,
      imageUrl: faker.image.url({ width: 640, height: 480 }),
      confidenceScore: parseFloat(faker.number.float({ min: 0.5, max: 1 }).toFixed(2)),
      corrected: faker.datatype.boolean(),
    });
  }
  return mockData;
}
