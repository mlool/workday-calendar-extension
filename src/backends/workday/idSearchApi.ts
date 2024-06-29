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
  const code =
    rawData["body"]["children"][1]["children"][0]["values"]["0"]["label"].split(
      " - "
    )[0]
  const possibleDetailsPath =
    rawData["body"]["children"][0]["children"][1]["children"]

  const meetingPatternIndex = possibleDetailsPath.findIndex(
    (item: DetailsPath) => item["label"] === "Meeting Patterns"
  )
  const detailsPath = possibleDetailsPath[meetingPatternIndex]["instances"]
  const rawDetails: string[] = []
  for (const detail of detailsPath) {
    rawDetails.push(detail["text"])
  }
  const instructorsIndex = possibleDetailsPath.findIndex(
    (item: DetailsPath) => item["widget"] === "panel"
  )

  const instructors: string[] = []
  if (instructorsIndex !== -1) {
    try {
      const instructorsPath =
        possibleDetailsPath[instructorsIndex]["children"][0]["children"][0][
          "instances"
        ]
      for (const instructor of instructorsPath) {
        instructors.push(instructor["text"])
      }
    } catch (error) {
      console.error("Error extracting instructors from search data:", error)
    }
  }
  const formattedData: RawWorkdayData = {
    code: code,
    name: formattedName,
    instructors: instructors,
    sectionDetails: parseSectionDetails(rawDetails),
    term: parseTerm(rawDetails),
  }
  return formattedData
}
