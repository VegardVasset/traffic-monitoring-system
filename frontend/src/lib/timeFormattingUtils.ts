export function formatTimeBin(binKey: string, binSize: "hour" | "day" | "week" | "month"): string {
    // Helper to get month name in English
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
  
    // Helper to get ISO week number
    function getISOWeek(date: Date) {
      // Based on the standard approach for ISO week
      const tempDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
      // Thursday in current week decides the year
      tempDate.setUTCDate(tempDate.getUTCDate() + 4 - (tempDate.getUTCDay() || 7));
      const yearStart = new Date(Date.UTC(tempDate.getUTCFullYear(), 0, 1));
      return Math.ceil((((tempDate.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    }
  
    switch (binSize) {
      case "hour": {
        // binKey is like "2025-03-12T14" (if you used substring(0,13))
        // We want "Hour 14" or "Hour 2" etc.
        // Parse the hour from the last 2 characters
        const hourString = binKey.slice(-2);
        const hour = parseInt(hourString, 10);
        return `Hour ${hour}`;
      }
  
      case "day": {
        // binKey is "YYYY-MM-DD"
        const date = new Date(binKey);
        const day = date.getDate();
        const month = monthNames[date.getMonth()];
        const year = date.getFullYear();
        return `${day}. ${month} ${year}`; // e.g. "2. March 2025"
      }
  
      case "week": {
        // binKey is "YYYY-MM-DD" for the start of the week
        const date = new Date(binKey);
        const weekNo = getISOWeek(date);
        const year = date.getFullYear();
        return `Week ${weekNo} ${year}`; // e.g. "Week 10 2025"
      }
  
      case "month": {
        // binKey is "YYYY-MM"
        const [yearString, monthString] = binKey.split("-");
        const year = parseInt(yearString, 10);
        const monthIndex = parseInt(monthString, 10) - 1; // 0-based
        const monthName = monthNames[monthIndex];
        return `${monthName} ${year}`; // e.g. "January 2025"
      }
  
      default:
        return binKey; // fallback
    }
  }
  