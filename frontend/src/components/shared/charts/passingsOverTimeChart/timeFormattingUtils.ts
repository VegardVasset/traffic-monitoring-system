"use client";

export function formatTimeBin(binKey: string, binSize: "hour" | "day" | "week" | "month"): string {
  if (binSize === "hour") {
    const date = new Date(binKey + ":00:00Z");
    return date.toLocaleString("en-GB", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } else if (binSize === "day") {
    const date = new Date(binKey);
    return date.toLocaleDateString("en-GB", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } else if (binSize === "week") {
    return formatIsoWeekBin(binKey);
  } else if (binSize === "month") {
    const parseableKey = binKey.length === 7 ? binKey + "-01" : binKey;
    const date = new Date(parseableKey);
    return date.toLocaleDateString("en-GB", {
      year: "numeric",
      month: "short",
    });
  }
  return binKey;
}


function formatIsoWeekBin(binKey: string): string {
  const monday = new Date(binKey);
  const isoYear = getIsoWeekYear(monday);
  const isoWeek = getIsoWeekNumber(monday);
  return `Week ${isoWeek}, ${isoYear}`;
}

function getIsoWeekYear(date: Date): number {
  const temp = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  let day = temp.getUTCDay();
  if (day === 0) day = 7;
  temp.setUTCDate(temp.getUTCDate() + (4 - day));

  return temp.getUTCFullYear();
}

function getIsoWeekNumber(date: Date): number {
  const temp = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  let day = temp.getUTCDay();
  if (day === 0) day = 7;
  temp.setUTCDate(temp.getUTCDate() + (4 - day));

  const year = temp.getUTCFullYear();
  const firstThursday = new Date(Date.UTC(year, 0, 4));

  const diff = temp.getTime() - firstThursday.getTime();
  const oneDay = 24 * 60 * 60 * 1000;
  const dayOfYear = Math.floor(diff / oneDay) + 1;

  return Math.floor(dayOfYear / 7) + 1;
}
