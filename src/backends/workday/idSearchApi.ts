import { ISectionData } from "../../content/App/App.types"
import { handleProgressUpdate } from "../scheduler/nameSearchHelpers"
import {
  fetchSearchData,
  parseSectionDetails,
  DetailsPath,
  parseSessionAndTerms,
} from "./idSearchHelpers"
import { defaultColorList } from "../../content/Settings/Theme/courseColors"
import Section from "../../objects/Section"
import { collectNodesWithLabel, convertTo24HourFormat, extractWorkdaySectionInfo, parseSessionAndTermFromDateRange } from "./nodeSearchHelpers"
import SectionDetail from "../../objects/SectionDetail"

const searchEndpoint = "https://wd10.myworkday.com/ubc/inst/1$15194/15194$"

export async function fetchWorkdayData(
  courseId: string
): Promise<ISectionData | null> {
  const rawData = await fetchSearchData(`${searchEndpoint}${courseId}.htmld`)
  handleProgressUpdate(65)
  const rawName =
    rawData["body"]["children"][0]["children"][0]["children"][0][
    "instances"
    ][0]["text"]
  const formattedName = rawName.split(" - ")[1]
  const code = rawName.split(" - ")[0]

  console.log(rawName)

  const possibleDetailsPath =
    rawData["body"]["children"][0]["children"][1]["children"][0]["children"]

  const meetingPatternIndex = possibleDetailsPath.findIndex(
    (item: DetailsPath) => item["label"] === "Meeting Patterns"
  )
  const detailsPath = possibleDetailsPath[meetingPatternIndex]["instances"]
  const rawDetails: string[] = []
  for (const detail of detailsPath) {
    rawDetails.push(detail["text"])
  }

  const instructorDetailsPath =
    rawData["body"]["children"][0]["children"][0]["children"]

  const instructorsIndex = instructorDetailsPath.findIndex(
    (item: DetailsPath) => item["widget"] === "panel"
  )

  const instructors: string[] = []
  if (instructorsIndex !== -1) {
    try {
      const instructorsPath =
        instructorDetailsPath[instructorsIndex]["children"][0]["instances"]
      for (const instructor of instructorsPath) {
        instructors.push(instructor["text"])
      }
    } catch (error) {
      // Not an error, just no instructors in Workday Response. Need a comment or Eslint gets mad
    }
  }
  handleProgressUpdate(75)

  const { session, terms } = parseSessionAndTerms(rawDetails)

  const formattedData: ISectionData = {
    code: code,
    name: formattedName,
    instructors: instructors,
    sectionDetails: parseSectionDetails(rawDetails),
    terms: terms,
    session: session,
    worklistNumber: 0,
    color: defaultColorList[0],
    courseID: courseId,
  }
  return formattedData
}


export async function fetchSectionFromID(courseId: string): Promise<Section | null> {
  const rawData = await fetchSearchData(`${searchEndpoint}${courseId}.htmld`)
  handleProgressUpdate(65)

  const selectedNodes = collectNodesWithLabel(rawData["body"]["children"][0]["children"]);

  const { code, name, instructors, format, meetingPatterns } = extractWorkdaySectionInfo(selectedNodes);

  const courseFullName = rawData["title"].instances[0].text;
  const match = courseFullName.match(/^[^-]+-(\S+)/); // Matches section code, eg. "202", "L22"
  const sectionCode = match ? match[1] : undefined;

  let session = "";
  const sectionDetails: SectionDetail[] = [];

  for (const meetingPattern of meetingPatterns) {
    const { session: parsedSession, sectionDetail } = getSectionDetailFromMeetingPattern(meetingPattern);
    session = parsedSession;
    sectionDetails.push(sectionDetail);
  }

  handleProgressUpdate(75);

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




