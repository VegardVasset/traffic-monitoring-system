import { faker } from "@faker-js/faker";
import { MockRecord } from "../types";

export const FRONTEND_URL = "http://localhost:3000";

export const vehicleImages = [
  `${FRONTEND_URL}/images/vehicle1.png`,
  `${FRONTEND_URL}/images/vehicle2.png`,
  `${FRONTEND_URL}/images/vehicle3.png`,
  `${FRONTEND_URL}/images/vehicle4.png`,
  `${FRONTEND_URL}/images/vehicle5.png`,
  `${FRONTEND_URL}/images/vehicle6.png`,
  `${FRONTEND_URL}/images/vehicle7.png`,
];

export const camerasByDomain: Record<string, { name: string; weight: number }[]> = {
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

export function getRandomTireCondition(): number {
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

export function getRandomSpeed(timestamp: string | number | Date) {
  let normalMin = 40;
  let normalMax = 120;
  if (timestamp) {
    const date = new Date(timestamp);
    const hour = date.getHours();
    if ((hour >= 8 && hour <= 10) || (hour >= 15 && hour <= 17)) {
      normalMin = 30;
      normalMax = 80;
    } else if (hour >= 21 || hour <= 5) {
      normalMin = 60;
      normalMax = 130;
    }
  }
  if (Math.random() < 0.9) {
    return faker.number.int({ min: normalMin, max: normalMax });
  } else {
    return Math.random() < 0.5
      ? faker.number.int({ min: 5, max: 20 })
      : faker.number.int({ min: 120, max: 200 });
  }
}

export function getRandomPassengerCount(vehicleType: MockRecord["vehicleType"]): number {
  switch (vehicleType) {
    case "buss":
    case "person transport":
      return faker.number.int({ min: 1, max: 5 });
    case "motorsykkel":
      return Math.random() < 0.8 ? 1 : 2;
    case "lastebil lukket":
    case "lastebil åpen":
    case "lastebil sylinder":
      return faker.number.int({ min: 1, max: 2 });
    case "lett industri":
    case "tilhenger":
      return faker.number.int({ min: 1, max: 2 });
    case "camping kjøretøy":
      return faker.number.int({ min: 1, max: 4 });
    case "utrykningskjøretøy":
      return faker.number.int({ min: 1, max: 3 });
    case "myke trafikanter":
    case "traktor":
      return 1;
    default:
      return faker.number.int({ min: 1, max: 5 });
  }
}

export function getRandomTireType(timestamp: string): "Sommerdekk" | "Vinterdekk" {
  const date = new Date(timestamp);
  const month = date.getMonth() + 1;
  let winterProbability = 0;
  if (month >= 12 || month <= 2) {
    winterProbability = 0.95;
  } else if (month >= 6 && month <= 8) {
    winterProbability = 0.05;
  } else if (month >= 3 && month <= 5) {
    winterProbability = 0.9 - (month - 3) * 0.3;
  } else if (month >= 9 && month <= 11) {
    winterProbability = 0.3 + (month - 9) * 0.3;
  }
  return Math.random() < winterProbability ? "Vinterdekk" : "Sommerdekk";
}

export function getWeightedHour(): number {
  if (Math.random() < 0.75) {
    if (Math.random() < 0.5) {
      return Math.random() < 0.5
        ? faker.number.int({ min: 8, max: 10 })
        : faker.number.int({ min: 15, max: 17 });
    } else {
      const nonRushHours = [6, 7, 11, 12, 13, 14, 18, 19, 20];
      return nonRushHours[faker.number.int({ min: 0, max: nonRushHours.length - 1 })];
    }
  } else {
    const nightHours = [0, 1, 2, 3, 4, 5, 21, 22, 23];
    return nightHours[faker.number.int({ min: 0, max: nightHours.length - 1 })];
  }
}

export function getRandomTimestamp(): string {
  const start = new Date();
  start.setFullYear(start.getFullYear() - 1);
  const end = new Date();
  let randomDate = faker.date.between({ from: start, to: end });
  randomDate.setHours(getWeightedHour());
  randomDate.setMinutes(faker.number.int({ min: 0, max: 59 }));
  randomDate.setSeconds(faker.number.int({ min: 0, max: 59 }));
  return randomDate.toISOString();
}

export function getRealisticConfidenceScore(): number {
  const highConfidence = faker.number.float({ min: 0.9, max: 1 }).toFixed(2);
  const occasionalLowerConfidence = faker.number.float({ min: 0.8, max: 0.89 }).toFixed(2);
  return Math.random() < 0.9 ? parseFloat(highConfidence) : parseFloat(occasionalLowerConfidence);
}

export function getRandomCamera(entityType: string): string {
  const validCameras = camerasByDomain[entityType] || [];
  const weightedList: string[] = [];
  validCameras.forEach(({ name, weight }) => {
    for (let i = 0; i < weight; i++) {
      weightedList.push(name);
    }
  });
  return weightedList[Math.floor(Math.random() * weightedList.length)];
}
