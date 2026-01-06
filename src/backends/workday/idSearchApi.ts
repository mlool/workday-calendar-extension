import { defaultColorList } from "../../content/Settings/Theme/courseColors"
import Section from "../../objects/Section"
import { collectNodesWithLabel, convertTo24HourFormat, extractWorkdaySectionInfo, parseSessionAndTermFromDateRange } from "./nodeSearchHelpers"
import SectionDetail from "../../objects/SectionDetail"

const searchEndpoint = "https://wd10.myworkday.com/ubc/inst/1$15194/15194$"

async function fetchSearchData(url: string) {
  try {
    const response = await fetch(url)
    return await response.json()
  } catch (error) {
    console.error("Error fetching data:", error)
    return null
  }
}

export async function fetchSectionFromID(courseId: string): Promise<Section | null> {
  const rawData = await fetchSearchData(`${searchEndpoint}${courseId}.htmld`)

  const selectedNodes = collectNodesWithLabel(rawData["body"]["children"][0]["children"]);

  const { code, name, instructors, format, meetingPatterns } = extractWorkdaySectionInfo(selectedNodes);

  const courseFullName = rawData["title"].instances[0].text;
  const match = courseFullName.match(/^[^-]+-(\S+)/); // Matches section code, eg. "202", "L22"
  const sectionCode = match ? match[1] : undefined;

  let session = "";
  const sectionDetails: SectionDetail[] = [];

  if (!meetingPatterns || meetingPatterns.length === 0) {
    alert("No meeting pattern found, this section does not have a meeting time set. If this is incorrect, please manually add the section time.")
    return null;
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
    defaultColorList[0],
    sectionCode,
    format,
    name,
    false,
  )
}

function getSectionDetailFromMeetingPattern(meetingPattern: string): { session: string, sectionDetail: SectionDetail } {
  const [_, building, floor, room, daysString, timeRange, dateRange] = meetingPattern.split(" | ");
  const [startTime, endTime] = timeRange.split(" - ").map(convertTo24HourFormat);
  const [startDate, endDate] = dateRange.split(" - ");
  const { session, terms } = parseSessionAndTermFromDateRange(dateRange);
  const days = daysString.split(" ").map((day: string) => day.trim());

  return {
    session: session,
    sectionDetail: new SectionDetail(
      terms,
      days,
      startTime,
      endTime,
      startDate,
      endDate,
      `${building} | ${floor} | ${room}`
    )
  }
}




