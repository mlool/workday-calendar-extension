export let sessionSecureToken: string = ""
import {
  getTermFromSectionDetailsString,
  parseSectionDetails,
} from "../content/utils"
import { SupplementaryData, ISectionData } from "../content/App/App.types"
import { defaultColorList } from "../content/Settings/courseColors"

async function buildRequestOptions(code: string, sessionSecureToken?: string) {
  const urlencoded = new URLSearchParams()
  urlencoded.append("q", code)

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

export async function fetchSecureToken() {
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
    return sessionSecureToken
  } catch (error) {
    console.error("Error fetching secure token:", error)
    return null
  }
}

export async function findCourseId(name: string): Promise<string> {
  const requestOptions = await buildRequestOptions(name, sessionSecureToken)

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

export async function findSupplementaryData(name: string) {
  const requestOptions = await buildRequestOptions(name, sessionSecureToken)

  const data = await fetchSearchData(
    "https://wd10.myworkday.com/ubc/faceted-search2/c12/fs0/search.htmld",
    requestOptions
  )

  if (data) {
    try {
      const path = data["children"][0]["listItems"][0]
      const instructors = path["detailResultFields"][2]["instances"]

      const instructorsArr: string[] = [""]
      if (instructors) {
        for (const item of instructors) {
          instructorsArr.push(item["text"])
        }
      }
      const locations = path["detailResultFields"][0]["instances"]

      const locationsArr: string[] = [""]
      if (locations) {
        for (const item of locations) {
          locationsArr.push(item["text"].split(" | ")[0])
        }
      }
      const newSupplementaryData: SupplementaryData = {
        instructors: instructorsArr,
        locations: locationsArr,
      }
      return newSupplementaryData
    } catch (error) {
      console.error("Error parsing course data:", error)
      return null
    }
  }
}

export async function findCourseInfo(code: string) {
  const requestOptions = await buildRequestOptions(code, sessionSecureToken)

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
        code: code,
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
