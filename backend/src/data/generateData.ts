import { faker } from "@faker-js/faker";
import { MockRecord } from "../types";
import { c } from "framer-motion/dist/types.d-6pKw1mTI";

// Cameras for each domain
const camerasByDomain: Record<string, { name: string; weight: number }[]> = {
  dts: [
    { name: "Trondheim", weight: 50 },
    { name: "Lillehammer", weight: 30 },
    { name: "Hamar", weight: 20 },
  ],
  tires: [
    { name: "Bergen Parkering", weight: 40 },
    { name: "Oslo Parkering", weight: 35 },
    { name: "Vardø", weight: 25 },
  ],
  vpc: [
    { name: "Rutledal", weight: 45 },
    { name: "Isane", weight: 35 },
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
function getRandomSpeed(timestamp: string | number | Date) {
  // Default normal range: 40-120 km/h.
  let normalMin = 40;
  let normalMax = 120;

  if (timestamp) {
    const date = new Date(timestamp);
    const hour = date.getHours();

    // Adjust the normal speed range based on the hour of the day.
    if ((hour >= 8 && hour <= 10) || (hour >= 15 && hour <= 17)) {
      // Rush hours: lower speeds due to heavy traffic.
      normalMin = 30;
      normalMax = 80;
    } else if (hour >= 21 || hour <= 5) {
      // Nighttime: higher speeds as speeding is more common.
      normalMin = 60;
      normalMax = 130;
    }
    // Otherwise, the default range is used.
  }

  // 90% of values are within the adjusted normal range,
  // 10% are anomalies (keeping the original anomaly logic)
  if (Math.random() < 0.9) {
    return faker.number.int({ min: normalMin, max: normalMax });
  } else {
    return Math.random() < 0.5
      ? faker.number.int({ min: 5, max: 20 })   // Slow anomalies
      : faker.number.int({ min: 120, max: 200 }); // Fast anomalies
  }
}

/**
 * Generate a passenger count based on the vehicle type.
 * - "buss": 20-50 passengers
 * - "person transport": 1-5 passengers
 * - "motorsykkel": usually 1, sometimes 2
 * - "lastebil" (lukket, åpen, sylinder) & "lett industri": 1-2 passengers
 * - "tilhenger": 0 passengers
 * - "camping kjøretøy": 1-4 passengers
 * - "utrykningskjøretøy": 1-3 passengers
 * - "myke trafikanter": always 1
 * - "traktor": always 1
 * - Default: 1-5 passengers
 */
function getRandomPassengerCount(vehicleType: MockRecord["vehicleType"]): number {
  switch (vehicleType) {
    case "buss":
      return faker.number.int({ min: 1, max: 5 });
    case "person transport":
      return faker.number.int({ min: 1, max: 5 });
    case "motorsykkel":
      return Math.random() < 0.8 ? 1 : 2;
    case "lastebil lukket":
    case "lastebil åpen":
    case "lastebil sylinder":
      return faker.number.int({ min: 1, max: 2 });
    case "lett industri":
      return faker.number.int({ min: 1, max: 2 });
    case "tilhenger":
      return faker.number.int({ min: 1, max: 2 });
    case "camping kjøretøy":
      return faker.number.int({ min: 1, max: 4 });
    case "utrykningskjøretøy":
      return faker.number.int({ min: 1, max: 3 });
    case "myke trafikanter":
      return 1;
    case "traktor":
      return 1;
    default:
      return faker.number.int({ min: 1, max: 5 });
  }
}

function getRandomTireType(timestamp: string): "Sommerdekk" | "Vinterdekk" {
  const date = new Date(timestamp);
  const month = date.getMonth() + 1; // JavaScript months are 0-based

  let winterProbability = 0;

  if (month >= 12 || month <= 2) {
    // Winter months → ~100% winter tires
    winterProbability = 0.95;
  } else if (month >= 6 && month <= 8) {
    // Summer months → ~100% summer tires
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

function getWeightedHour(): number {
  // 75% chance for a daytime hour, 25% for a nighttime hour
  if (Math.random() < 0.75) {
    // Within daytime, decide if it's rush hour (50% chance of daytime)
    if (Math.random() < 0.5) {
      // Choose randomly between morning rush (8-10) and afternoon rush (15-17)
      return Math.random() < 0.5
        ? faker.number.int({ min: 8, max: 10 })
        : faker.number.int({ min: 15, max: 17 });
    } else {
      // Choose a non-rush daytime hour
      const nonRushHours = [6, 7, 11, 12, 13, 14, 18, 19, 20];
      return nonRushHours[faker.number.int({ min: 0, max: nonRushHours.length - 1 })];
    }
  } else {
    // Nighttime hours: early morning or late night
    const nightHours = [0, 1, 2, 3, 4, 5, 21, 22, 23];
    return nightHours[faker.number.int({ min: 0, max: nightHours.length - 1 })];
  }
}

function getRandomTimestamp(): string {
  const start = new Date();
  start.setFullYear(start.getFullYear() - 1);
  const end = new Date();

  // Generate a random date between start and end
  let randomDate = faker.date.between({ from: start, to: end });

  // Set the hour using the weighted distribution that favors rush hours
  randomDate.setHours(getWeightedHour());
  randomDate.setMinutes(faker.number.int({ min: 0, max: 59 }));
  randomDate.setSeconds(faker.number.int({ min: 0, max: 59 }));

  return randomDate.toISOString();
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
    { type: "traktor", weight: 1 },
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
  entityType: "vpc" | "tires" | "dts",
  count: number,
  fixedTimes?: { creationTime: string; receptionTime: string }
): MockRecord[] {
  const mockData: MockRecord[] = [];
  for (let i = 0; i < count; i++) {
    const creationTime = fixedTimes?.creationTime || getRandomTimestamp();
    const receptionTime = fixedTimes?.receptionTime || getReceptionTime(creationTime);
    const vehicleType = getRandomVehicleType();

    const record: MockRecord = {
      id: i + 1,
      creationTime,
      receptionTime,
      vehicleType,
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

    if (entityType === "vpc") {
      record.passengerCount = getRandomPassengerCount(vehicleType);
    }

    if (entityType === "dts") {
      record.speed = getRandomSpeed(creationTime);
    }

    mockData.push(record);
  }
  return mockData;
}


