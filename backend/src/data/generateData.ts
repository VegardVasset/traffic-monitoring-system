import { faker } from "@faker-js/faker";
import { MockRecord } from "../types";

// Define cameras for each domain
const camerasByDomain: Record<string, { name: string; weight: number }[]> = {
  dts: [
    { name: "Os", weight: 50 },
    { name: "Hopseide", weight: 30 },
    { name: "Gedjne", weight: 20 },
  ],
  tires: [
    { name: "Bergen Parkering", weight: 40 },
    { name: "Oslo parking", weight: 35 },
    { name: "Vardø", weight: 25 },
  ],
  ferry: [
    { name: "Os", weight: 45 },
    { name: "Manheller", weight: 35 },
    { name: "Lavik", weight: 20 },
  ],
};

function getRandomTireType(): "Sommerdekk" | "Vinterdekk" {
  return Math.random() < 0.5 ? "Sommerdekk" : "Vinterdekk";
}

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

// Function to generate a random vehicle type
function getRandomVehicleType(): MockRecord["vehicleType"] {
  const vehicleDistribution: { type: MockRecord["vehicleType"]; weight: number }[] = [
    { type: "person transport", weight: 40 },
    { type: "buss", weight: 15 },
    { type: "motorsykkel", weight: 10 },
    { type: "lastebil lukket", weight: 8 },
    { type: "lastebil åpen", weight: 5 },
    { type: "lett industri", weight: 5 },
    { type: "tilhenger", weight: 5 },
    { type: "camping kjøretøy", weight: 4 },
    { type: "utrykningskjøretøy", weight: 3 },
    { type: "lastebil sylinder", weight: 3 },
    { type: "myke trafikanter", weight: 2 },
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

// Function to select a camera based on domain
function getRandomCamera(entityType: string): string {
  const validCameras = camerasByDomain[entityType] || [];
  const weightedList: string[] = [];

  validCameras.forEach(({ name, weight }) => {
    for (let i = 0; i < weight; i++) {
      weightedList.push(name);
    }
  });

  return weightedList[Math.floor(Math.random() * weightedList.length)];
}

// Function to generate a confidence score (mostly 90-100%)
function getRealisticConfidenceScore(): number {
  const highConfidence = faker.number.float({ min: 0.90, max: 1 }).toFixed(2);
  const occasionalLowerConfidence = faker.number.float({ min: 0.80, max: 0.89 }).toFixed(2);
  
  return Math.random() < 0.9 ? parseFloat(highConfidence) : parseFloat(occasionalLowerConfidence);
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

    const record: MockRecord = {
      id: i + 1,
      creationTime,
      receptionTime,
      vehicleType: getRandomVehicleType(),
      camera: getRandomCamera(entityType),
      laneId: `Lane_${faker.number.int({ min: 1, max: 5 })}`,
      edgeId: `Edge_${faker.number.int({ min: 1, max: 3 })}`,
      imageUrl: faker.image.url({ width: 640, height: 480 }),
      confidenceScore: getRealisticConfidenceScore(),
      corrected: faker.datatype.boolean(),
    };

    
    if (entityType === "tires") {
      record.tireType = getRandomTireType();
    }

    mockData.push(record);
  }
  return mockData;
}
