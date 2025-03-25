import { faker } from "@faker-js/faker";
import { MockRecord } from "../types";
import { 
  getRandomTireCondition,
  getRandomSpeed,
  getRandomPassengerCount,
  getRandomTireType,
  getRandomTimestamp,
  getRealisticConfidenceScore,
  getRandomCamera,
  vehicleImages
} from "../utils/randomHelpers";

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
      imageUrl: vehicleImages[faker.number.int({ min: 0, max: vehicleImages.length - 1 })],
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
