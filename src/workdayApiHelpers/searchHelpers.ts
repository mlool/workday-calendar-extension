import {
  getTermFromSectionDetailsString,
  parseSectionDetails,
} from "../content/utils"
import { SupplementaryData, ISectionData } from "../content/App/App.types"
import { defaultColorList } from "../content/Settings/courseColors"

let sessionSecureToken: string = ""

function buildRequestOptions(searchTerm: string) {
  const urlencoded = new URLSearchParams()
  urlencoded.append("q", searchTerm)

  const headers = new Headers({
    "Content-Type": "application/x-www-form-urlencoded",
  })

  if (sessionSecureToken) {
    urlencoded.append("sessionSecureToken", sessionSecureToken)
    headers.set("Session-Secure-Token", sessionSecureToken)
  }

  return {
    method: "POST",
    body: urlencoded,
    redirect: "follow" as RequestRedirect,
    headers,
  }
}

async function fetchSearchData(url: string, requestOptions: RequestInit) {
  try {
    const response = await fetch(url, requestOptions)
    return await response.json()
  } catch (error) {
    console.error("Error fetching data:", error)
    return null
  }
}

async function fetchSecureToken(): Promise<void> {
  const headers = new Headers({
    Accept: "application/json",
    "Content-Type": "application/json",
    "Session-Secure-Token": "",
  })

  const urlencoded = new URLSearchParams()

  const requestOptions = {
    method: "POST",
    body: urlencoded,
    redirect: "follow" as RequestRedirect,
    headers,
  }

  try {
    const response = await fetch(
      "https://wd10.myworkday.com/ubc/app-root",
      requestOptions
    )
    const data = await response.json()
    sessionSecureToken = data["sessionSecureToken"]
  } catch (error) {
    console.error("Error fetching secure token:", error)
  }
}

async function findCourseId(searchTerm: string): Promise<string> {
  const requestOptions = buildRequestOptions(searchTerm)

  const data = await fetchSearchData(
    "https://wd10.myworkday.com/ubc/faceted-search2/c12/fs0/search.htmld",
    requestOptions
  )

  if (data) {
    try {
      const courseId =
        data["children"][0]["listItems"][0]["title"]["instances"][0][
          "instanceId"
        ]
      return courseId.split("$")[1]
    } catch (error) {
      console.error("Error parsing course data:", error)
      return ""
    }
  }
  return ""
}

async function findSupplementaryData(
  searchTerm: string
): Promise<SupplementaryData | null | undefined> {
  const requestOptions = buildRequestOptions(searchTerm)

  const data = await fetchSearchData(
    "https://wd10.myworkday.com/ubc/faceted-search2/c12/fs0/search.htmld",
    requestOptions
  )

  if (data) {
    try {
      const path = data["children"][0]["listItems"][0]
      const rawInstructorData = path["detailResultFields"][2]["instances"]

      const instructors: string[] = []
      if (rawInstructorData) {
        for (const item of rawInstructorData) {
          instructors.push(item["text"])
        }
      }
      const rawLocationData = path["detailResultFields"][0]["instances"]

      const locations: string[] = [""]
      if (rawLocationData) {
        for (const item of rawLocationData) {
          locations.push(item["text"].split(" | ")[0])
        }
      }
      const newSupplementaryData: SupplementaryData = {
        instructors: instructors,
        locations: locations,
      }
      return newSupplementaryData
    } catch (error) {
      console.error("Error parsing course data:", error)
      return null
    }
  }
}

async function findCourseInfo(
  searchTerm: string
): Promise<ISectionData | null | undefined> {
  const requestOptions = buildRequestOptions(searchTerm)

  const data = await fetchSearchData(
    "https://wd10.myworkday.com/ubc/faceted-search2/c12/fs0/search.htmld",
    requestOptions
  )
  if (data) {
    try {
      const path = data["children"][0]["listItems"][0]
      const name = path["title"]["instances"][0]["text"]
      const id = path["title"]["instances"][0]["instanceId"]
      const sectionDetailsArr: string[] = []
      for (const item of path["detailResultFields"][0]["instances"]) {
        sectionDetailsArr.push(item["text"])
      }
      const newSection: ISectionData = {
        code: searchTerm,
        name: name.slice(name.indexOf(" - ") + 3),
        sectionDetails: parseSectionDetails(sectionDetailsArr),
        term: getTermFromSectionDetailsString(sectionDetailsArr),
        worklistNumber: 0,
        color: defaultColorList[0],
        courseID: id.split("$")[1],
      }
      return newSection
    } catch (error) {
      console.error("Error parsing course data:", error)
      return null
    }
  }
}

export { fetchSecureToken, findCourseId, findSupplementaryData, findCourseInfo }
