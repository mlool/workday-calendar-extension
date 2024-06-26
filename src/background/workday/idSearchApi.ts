import {
  fetchSearchData,
  parseTerm,
  parseSectionDetails,
  RawWorkdayData,
  DetailsPath,
} from "./idSearchHelpers"

const searchEndpoint = "https://wd10.myworkday.com/ubc/inst/1$15194/15194$"

export async function fetchWorkdayData(
  courseId: string
): Promise<RawWorkdayData | null> {
  const rawData = await fetchSearchData(`${searchEndpoint}${courseId}.htmld`)

  const path = rawData["body"]["children"][0]["children"][0]["children"]
  const rawName = path[0]["instances"][0]["text"]
  const formattedName = rawName.split(" - ")[1]

  const possibleDetailsPath =
    rawData["body"]["children"][0]["children"][1]["children"]
  const meetingPatternIndex = possibleDetailsPath.findIndex(
    (item: DetailsPath) => item["label"] === "Meeting Patterns"
  )
  const detailsPath = possibleDetailsPath[meetingPatternIndex]["instances"]

  let rawDetails: string[] = []
  for (const detail of detailsPath) {
    rawDetails.push(detail["text"])
  }

  const instructorsIndex = possibleDetailsPath.findIndex(
    (item: DetailsPath) => item["widget"] === "panel"
  )

  const instructorsPath =
    possibleDetailsPath[instructorsIndex]["children"][0]["children"][0][
      "instances"
    ]
  let instructors: string[] = []
  for (const instructor of instructorsPath) {
    instructors.push(instructor["text"])
  }

  const formattedData: RawWorkdayData = {
    name: formattedName,
    instructors: instructors,
    sectionDetails: parseSectionDetails(rawDetails),
    term: parseTerm(rawDetails),
  }
  return formattedData
}
