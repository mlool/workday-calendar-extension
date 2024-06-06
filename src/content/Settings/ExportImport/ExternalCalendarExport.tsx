import { ISectionData } from "../../App/App.types";
import { formatDateArray, generateICal } from './ExternalCalendarExportHelper';

// Interface for formatting section details into calendar event
export interface Event {
  title: string;
  description: string;
  location?: string; 
  recurrenceRule: string;
  start: number[]; 
  end: number[]; 
  }

// Formats section details into an event and generates download link
export const handleExternalCalendarExport = (sections: ISectionData[]) => {
    
  // Dictionary to store formatted events grouped by worklist
  const formattedEventsByWorklist: { [worklist: number]: Event[] } = {};

  // Loop through all sections
  for(let i = 0; i < sections.length; i++) {

    // Save as constants for code readability later
    const term = sections[i].sectionDetails[0].term;
    const days = sections[i].sectionDetails[0].days;
    const startTime = sections[i].sectionDetails[0].startTime;
    const endTime = sections[i].sectionDetails[0].endTime;
    const worklist = sections[i].worklistNumber;

    // Dictionary of required format
    const dayMap = { Mon: "MO", Tue: "TU", Wed: "WE", Thu: "TH", Fri: "FR" };

    // Map to new format
    const formattedDays = days.map(day => dayMap[day as keyof typeof dayMap]).join(",");

    // Define base start and end dates based on term. Weird hardcode solution. Will need more robust solution for future
    const baseStartDates = {
        0: [2025, 5, 12], // Week of May 12, 2025
        1: [2025, 7, 2], // Week of June 2, 2025
        2: [2025, 5, 12], // Week of May 12, 2025
        3: [2024, 9, 3], // Week of Sep 3, 2024
        4: [2025, 1, 6], // Week of Jan 6, 2025
        5: [2024, 9, 3], // Week of Sep 3, 2024
    };

    const baseEndDates = {
      0: [2025, 7, 19, 23, 59], // Week of June 19, 2025
      1: [2025, 8, 8, 23, 59], // Week of Aug 8, 2025
      2: [2025, 8, 8, 23, 59], // Week of Aug 8, 2025
      3: [2024, 12, 6, 23, 59], // Week of Dec 6, 2024
      4: [2025, 4, 8, 23, 59], // Week of Apr 8, 2025
      5: [2025, 4, 8, 23, 59], // Week of Apr 8, 2025
  };

    // Handle invalid terms
    if (!baseStartDates.hasOwnProperty(term)) {
      throw new Error("Invalid term value: " + term);
    }

    const baseYear = baseStartDates[term][0];
    const baseMonth = baseStartDates[term][1];
    const baseDay = baseStartDates[term][2];

    const baseDateObject = new Date(baseYear, baseMonth - 1, baseDay);  // Adjust for zero-based month indexing
    
    // Find the earliest day in the week of days array
    const earliestDay = days.find(day => day === "Mon" || day === "Tue" || day === "Wed" || day === "Thu" || day === "Fri");

    // Map that to a number
    const earliestDayNumber = earliestDay ? {  
        Mon: 1,
        Tue: 2,
        Wed: 3,
        Thu: 4,
        Fri: 5,
    }[earliestDay] : undefined;
        
    if (earliestDayNumber === undefined) {
      console.error("No matching weekday found in 'days' array");
    } else {

      // Calculate offset from base
      let offsetDays = (earliestDayNumber - baseDateObject.getDay() + 7) % 7;

      // Get start date using base + offset
      const startDateObject = new Date(baseDateObject.getTime() + offsetDays * 24 * 60 * 60 * 1000);
      const startDate = startDateObject.getDate();
      
      // Split start and endtimes into useable format
      const [startHourString, startMinuteString] = startTime.split(":");

      const startHour = parseInt(startHourString);
      const startMinute = parseInt(startMinuteString);

      const [endHourString, endMinuteString] = endTime.split(":");

      const endHour = parseInt(endHourString);
      const endMinute = parseInt(endMinuteString);

      // Create event
      const event: Event = {
          title: sections[i].code,
          description: sections[i].name,
          location: sections[i].sectionDetails[0].location,
          recurrenceRule: "FREQ=WEEKLY;BYDAY=" + formattedDays + ";INTERVAL=1;UNTIL=" + formatDateArray(baseEndDates[term]),
          start: [baseYear, baseMonth, startDate, startHour, startMinute],
          end: [baseYear, baseMonth, startDate, endHour, endMinute],
      };

      // Add event to the corresponding worklist group
      if (!formattedEventsByWorklist.hasOwnProperty(worklist)) {
        formattedEventsByWorklist[worklist] = [];
      }
      formattedEventsByWorklist[worklist].push(event);
    }
      
  }

  // Loop through formatted events grouped by worklist
  for (const worklist in formattedEventsByWorklist) {
    const eventsForWorklist = formattedEventsByWorklist[worklist];

    // Generate ICS string for this worklist's events
    const calendarString = generateICal(eventsForWorklist); 

    // Convert string to downloadable blob
    const blob = new Blob([calendarString], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `worklist_${worklist}.ics`; // Download filename with worklist number

    link.click();

    URL.revokeObjectURL(url);
  }
};


  
