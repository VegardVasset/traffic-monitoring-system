export function formatTimeBin(binKey: string, binSize: "hour" | "day" | "week" | "month"): string {
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
  
    // Helper to get ISO week number
    function getISOWeek(date: Date) {
      const tempDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
      tempDate.setUTCDate(tempDate.getUTCDate() + 4 - (tempDate.getUTCDay() || 7));
      const yearStart = new Date(Date.UTC(tempDate.getUTCFullYear(), 0, 1));
      return Math.ceil((((tempDate.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    }
  
    switch (binSize) {
      case "hour": {
        const hourString = binKey.slice(-2);
        const hour = parseInt(hourString, 10);
        return `Hour ${hour}`;
      }
  
      case "day": {
        const date = new Date(binKey);
        const day = date.getDate();
        const month = monthNames[date.getMonth()];
        const year = date.getFullYear();
        return `${day}. ${month} ${year}`; 
      }
  
      case "week": {
        const date = new Date(binKey);
        const weekNo = getISOWeek(date);
        const year = date.getFullYear();
        return `Week ${weekNo} ${year}`;
      }
  
      case "month": {
        const [yearString, monthString] = binKey.split("-");
        const year = parseInt(yearString, 10);
        const monthIndex = parseInt(monthString, 10) - 1;
        const monthName = monthNames[monthIndex];
        return `${monthName} ${year}`; 
      }
  
      default:
        return binKey; 
    }
  }
  