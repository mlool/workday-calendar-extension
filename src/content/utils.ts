import { Term } from "../popup/App/App.types";

// Interface representing a section of a course
export interface ISection {
  code: string; // Course code
  name: string; // Course name
  location: string; // Location where the course takes place
  days: string[]; // Days of the week the course is held on
  startTime: string; // Start time of the course
  endTime: string; // End time of the course
  term: Term; // Term when the course is offered
}

export enum ButtonActionType {
  click,
  hover
}

export const baseSection: ISection = {
  code: "CPSC_V",
  name: "sadsadsa",
  location: "",
  days: [],
  startTime: "",
  endTime: "",
  term: Term.winterOne,
}

// Function to convert time from 12-hour to 24-hour format
export function convertTo24(time: string): string {
    const regex = /^(\d{1,2}):(\d{2})\s*(a\.m\.|p\.m\.)$/i;
    const match = time.match(regex);
  
    if (!match) {
      throw new Error('Invalid time format');
    }
  
    let [_, hours, minutes, period] = match;
    let hoursNumber = parseInt(hours, 10);
  
    if (period.toLowerCase() === 'p.m.' && hoursNumber !== 12) {
      hoursNumber += 12;
    } else if (period.toLowerCase() === 'a.m.' && hoursNumber === 12) {
      hoursNumber = 0;
    }
  
    const formattedHours = hoursNumber.toString().padStart(2, '0');
    const formattedMinutes = minutes.padStart(2, '0');
  
    return `${formattedHours}:${formattedMinutes}`;
  }
  
export function extractSection(element: Element) {
  const courseLabels = element.parentElement?.querySelectorAll('.gwt-Label.WKIP.WDHP');
  // Checking if course labels exist and there are at least two of them
  if (!courseLabels || courseLabels.length < 2) {
    alert('Title or section details not found');
    return;
  }

  // Extracting title and section details from the labels
  const titleElement = courseLabels[0];
  const sectionDetailsElement = courseLabels[1];
  const title = titleElement.textContent;
  const sectionDetails = sectionDetailsElement.textContent;

  // Checking if title or section details are missing
  if (!title || !sectionDetails) {
    alert('Title or section details not found');
    return;
  }

  // Splitting title and section details into parts
  const titleParts = title.split(' - ');
  const detailsParts = sectionDetails.split(' | ');

  // Checking if title and section details have the expected format
  if (titleParts.length !== 2 || detailsParts.length !== 4) {
    alert(JSON.stringify(titleParts));
    alert(JSON.stringify(detailsParts));
    alert('Invalid title or section details format');
    return;
  }

  // Extracting individual parts from title and section details
  const [code, name] = titleParts;
  const [location, daysString, timeRange, dateRange] = detailsParts;
  const days = daysString.split(' ');
  const [startTime, endTime] = timeRange.split(' - ');

  // Determining the term based on the date range
  const term = dateRange === '2024-09-03 - 2024-12-05' ? Term.winterOne : Term.winterTwo;

  // Creating a new section object
  const newSection: ISection = {
    code,
    name,
    location,
    days,
    startTime: convertTo24(startTime),
    endTime: convertTo24(endTime),
    term,
  };

  return newSection
}