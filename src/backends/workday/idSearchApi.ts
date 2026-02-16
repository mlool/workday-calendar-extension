import Section from "../../objects/Section"
import { collectNodesWithLabel, convertTo24HourFormat, extractWorkdaySectionInfo, parseSessionAndTermFromDateRange } from "./nodeSearchHelpers"
import SectionDetail from "../../objects/SectionDetail"
import ExtensionStorage from "../../objects/ExtensionStorage"
import { SECTION_COLORS } from "../../content/theme"


export async function fetchSectionFromID(courseId: string): Promise<Section | null> {
  // Potential issue: the hardcoded path segment `1$15194/15194$` works for me
  // and for most users, but there have been isolated reports where adding a
  // course via the button fails.
  //
  // These cases are not yet fully understood. If we confirm that the automated
  // button fails while a manually pasted URL works, a possible fallback is to
  // store the manually added URL in extension storage and reuse it.
  const url = `https://wd10.myworkday.com/ubc/inst/1$15194/15194$${courseId}.htmld`
  return fetchSectionFromUrl(url)
}

export async function fetchSectionFromUrl(url: string): Promise<Section | null> {
  // When pasting a URL manually, the "Copy URL" button produces links like:
  // https://wd10.myworkday.com/ubc/d/inst/15$365714/15194$445563.htmld
  // This endpoint returns a DOC response. We found that removing the `/d`
  // segment causes the request to return the JSON response instead.
  const updatedUrl = url.replace("/d/", "/")
  try {
    const response = await fetch(updatedUrl)
    const data = await response.json()
    return fetchSectionFromJSON(data, getCourseIdFromUrl(updatedUrl))
  } catch (error) {
    console.error("Error fetching data:", error)
    return null
  }
}

function getCourseIdFromUrl(url: string): string {
  const parts = url.split("$")
  return parts[2].split(".")[0]
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function fetchSectionFromJSON(data: any, courseId: string): Section | null {
  if (!data) {
    throw new Error("Failed to fetch section from JSON")
  }

  const selectedNodes = collectNodesWithLabel(data["body"]["children"][0]["children"]);

  const { code, name, instructors, format, meetingPatterns } = extractWorkdaySectionInfo(selectedNodes);

  const courseFullName = data["title"].instances[0].text;
  const match = courseFullName.match(/^[^-]+-(\S+)/); // Matches section code, eg. "202", "L22"
  const sectionCode = match ? match[1] : undefined;

  let session = "";
  const sectionDetails: SectionDetail[] = [];

  if (!meetingPatterns || meetingPatterns.length === 0) {
    throw new Error("No meeting pattern found, this section does not have a meeting time set. If this is incorrect, please manually add the section time.")
  }

  for (const meetingPattern of meetingPatterns) {
    const { session: parsedSession, sectionDetail } = getSectionDetailFromMeetingPattern(meetingPattern);
    session = parsedSession;
    sectionDetails.push(sectionDetail);
  }

  return new Section(
    code,
    courseId,
    instructors,
    sectionDetails,
    session,
    0,
    SECTION_COLORS[0],
    sectionCode,
    format,
    name,
    false,
  )
}

const isCampus = (s: string) => /^[A-Z]{2,6}$/.test(s); // e.g., UBCV
const isFloor = (s: string) => /^Floor:\s*-?\w+$/i.test(s); // Floor: 1, Floor: G, Floor: -1
const isRoom = (s: string) => /^Room:\s*[\w-]+$/i.test(s); // Room: 1005, Room: A-123
const isDays = (s: string) =>
  /^(Mon|Tue|Wed|Thu|Fri|Sat|Sun)(\s+(Mon|Tue|Wed|Thu|Fri|Sat|Sun))*$/i.test(s); // "Tue Thu"
const isTimeRange = (s: string) =>
  /^\d{1,2}:\d{2}\s*(a\.m\.|p\.m\.)\s*-\s*\d{1,2}:\d{2}\s*(a\.m\.|p\.m\.)$/i.test(s);
const isDateRange = (s: string) =>
  /^\d{4}-\d{2}-\d{2}\s*-\s*\d{4}-\d{2}-\d{2}$/.test(s);

type MeetingParts = {
  campus?: string;
  building?: string; // built from leftovers
  floor?: string;
  room?: string;
  daysString?: string;
  timeRange?: string;
  dateRange?: string;
  extras?: string[]; // Kept for debugging
};

function getSectionDetailFromMeetingPattern(meetingPattern: string): { session: string, sectionDetail: SectionDetail } {
  const tokens = meetingPattern.split("|").map(t => t.trim()).filter(Boolean);

  const result: MeetingParts = { extras: [] };
  const buildingBits: string[] = [];

  for (const token of tokens) {
    if (!result.campus && isCampus(token)) {
      result.campus = token;
      continue;
    }
    if (!result.floor && isFloor(token)) {
      result.floor = token.replace(/^Floor:\s*/i, "").trim();
      continue;
    }
    if (!result.room && isRoom(token)) {
      result.room = token.replace(/^Room:\s*/i, "").trim();
      continue;
    }
    if (!result.daysString && isDays(token)) {
      result.daysString = token;
      continue;
    }
    if (!result.timeRange && isTimeRange(token)) {
      result.timeRange = token;
      continue;
    }
    if (!result.dateRange && isDateRange(token)) {
      result.dateRange = token;
      continue;
    }
    // If it doesn't match anything, treat as building
    buildingBits.push(token);
  }

  const [startTime, endTime] = result.timeRange?.split(" - ").map(convertTo24HourFormat) ?? [];
  const [startDate, endDate] = result.dateRange?.split(" - ") ?? [];
  const { session, terms } = parseSessionAndTermFromDateRange(result.dateRange ?? "");
  const days = result.daysString?.split(" ").map((day: string) => day.trim()) ?? [];

  const building = buildingBits.join(" ");
  const location = (building || result.floor || result.room) ? `${building} | Floor: ${result.floor} | Room: ${result.room}` : ""

  return {
    session: session,
    sectionDetail: new SectionDetail(
      terms,
      days,
      startTime,
      endTime,
      startDate,
      endDate,
      location
    )
  }
}

export async function extractSection(element: Element) {
  const courseId = extractIdFromDOM(element)

  if (!courseId) {
    throw new Error("Course ID not found, please manually add the section by url")
  }

  const fetchedSection = await fetchSectionFromID(courseId)

  if (!fetchedSection) {
    throw new Error("Section failed to be fetched")
  }
  await ExtensionStorage.setNewSection(fetchedSection)

}

const extractIdFromDOM = (element: Element) => {
  const courseIdElement = element.querySelector(
    '[data-automation-id^="selectedItem_15194"]'
  )

  if (
    courseIdElement &&
    courseIdElement instanceof HTMLElement &&
    courseIdElement.dataset.automationId
  ) {
    const automationIdParts = courseIdElement.dataset.automationId.split("_")
    const courseId = automationIdParts[1].split("$")[1]

    return courseId
  } else {
    return null
  }
}


