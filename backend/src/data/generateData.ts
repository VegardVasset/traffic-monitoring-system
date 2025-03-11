import { faker } from "@faker-js/faker";
import { MockRecord } from "../types";

// Cameras for each domain
const camerasByDomain: Record<string, { name: string; weight: number }[]> = {
  dts: [
    { name: "Os", weight: 50 },
    { name: "Hopseide", weight: 30 },
    { name: "Gedjne", weight: 20 },
  ],
  tires: [
    { name: "Bergen Parkering", weight: 40 },
    { name: "Oslo Parkering", weight: 35 },
    { name: "Vardø", weight: 25 },
  ],
  ferry: [
    { name: "Os", weight: 45 },
    { name: "Manheller", weight: 35 },
    { name: "Lavik", weight: 20 },
  ],
};

function getRandomTireCondition(): number {
  const weightedValues: number[] = [];

  const distribution = [
    { value: 5, weight: 50 },
    { value: 4, weight: 30 },
    { value: 3, weight: 15 },
    { value: 2, weight: 4 },
    { value: 1, weight: 1 },
  ];

  distribution.forEach(({ value, weight }) => {
    for (let i = 0; i < weight; i++) {
      weightedValues.push(value);
    }
  });

  return weightedValues[Math.floor(Math.random() * weightedValues.length)];
}


function getRandomPassengerCount(): number {
  return faker.number.int({ min: 1, max: 5 });
}

function getRandomTireType(timestamp: string): "Sommerdekk" | "Vinterdekk" {
  const date = new Date(timestamp);
  const month = date.getMonth() + 1; // JavaScript months are 0-based

  let winterProbability = 0;

  if (month >= 12 || month <= 2) {
    // Winter months (December, January, February) → ~100% winter tires
    winterProbability = 0.95;
  } else if (month >= 6 && month <= 8) {
    // Summer months (June, July, August) → ~100% summer tires
    winterProbability = 0.05;
  } else if (month >= 3 && month <= 5) {
    // Transition Spring: Gradually decrease winter tires
    winterProbability = 0.9 - (month - 3) * 0.3; // 90% → 60% → 30%
  } else if (month >= 9 && month <= 11) {
    // Transition Autumn: Gradually increase winter tires
    winterProbability = 0.3 + (month - 9) * 0.3; // 30% → 60% → 90%
  }

  return Math.random() < winterProbability ? "Vinterdekk" : "Sommerdekk";
}


function getRandomTimestamp(): string {
  const start = new Date();
  start.setFullYear(start.getFullYear() - 1); 
  const end = new Date();
  return faker.date.between({ from: start, to: end }).toISOString();
}

export function getReceptionTime(creationTime: string): string {
  const creationDate = new Date(creationTime);
  const delaySeconds = faker.number.int({ min: 2, max: 10 });
  creationDate.setSeconds(creationDate.getSeconds() + delaySeconds);
  return creationDate.toISOString();
}

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
    { type: "traktor", weight: 0 },
  ];

  const weightedList: MockRecord["vehicleType"][] = [];
  vehicleDistribution.forEach(({ type, weight }) => {
    for (let i = 0; i < weight; i++) {
      weightedList.push(type);
    }
  });
  return weightedList[Math.floor(Math.random() * weightedList.length)];
}

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

function getRealisticConfidenceScore(): number {
  const highConfidence = faker.number.float({ min: 0.9, max: 1 }).toFixed(2);
  const occasionalLowerConfidence = faker.number.float({ min: 0.8, max: 0.89 }).toFixed(2);
  return Math.random() < 0.9 ? parseFloat(highConfidence) : parseFloat(occasionalLowerConfidence);
}

/**
 * Generate an array of mock records for the given entityType.
 */
export function generateMockData(
  entityType: "ferry" | "tires" | "dts",
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
      record.tireType = getRandomTireType(creationTime);
      record.tireCondition = getRandomTireCondition();
    }

    if (entityType === "ferry") {
      record.passengerCount = getRandomPassengerCount();
    }

    mockData.push(record);
  }
  return mockData;
}
