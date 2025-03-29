import { ISectionData } from "../../content/App/App.types"
import { handleProgressUpdate } from "../scheduler/nameSearchHelpers"
import {
  fetchSearchData,
  parseSectionDetails,
  DetailsPath,
  parseSessionAndTerms,
} from "./idSearchHelpers"
import { defaultColorList } from "../../content/Settings/Theme/courseColors"

const searchEndpoint = "https://wd10.myworkday.com/ubc/inst/1$15194/15194$"

export async function fetchWorkdayData(
  courseId: string
): Promise<ISectionData | null> {
  const rawData = await fetchSearchData(`${searchEndpoint}${courseId}.htmld`)
  handleProgressUpdate(65)
  const path = rawData["body"]["children"][0]["sections"][0]["children"]
  const rawName = path[0]["children"][0]["instances"][0]["text"]
  const formattedName = rawName.split(" - ")[1]
  const code =
    rawData["body"]["children"][0]["sections"][2]["children"][0]["children"][0][
      "values"
    ]["0"]["label"].split(" - ")[0]

  const possibleDetailsPath =
    rawData["body"]["children"][0]["sections"][1]["children"][0]["children"][0][
      "children"
    ][0]["children"]

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
