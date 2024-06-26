import { ISectionData } from "../../content/App/App.types"
import { defaultColorList } from "../../helpers/courseColors"
import {
  getUrlFromSearchTerm,
  getCourseIdFromUrl,
  fetchSearchData,
  parseSearchParameters,
} from "./nameSearchHelpers"
import { fetchWorkdayData } from "../workday/idSearchApi"
import { RawWorkdayData } from "../workday/idSearchHelpers"

const searchEndpoint =
  "https://coursescheduler-api-2.vercel.app/api/W/sections?"

export async function findCourseId(searchTerm: string): Promise<string | null> {
  const { subject, courseNumber, sectionNumber, campus } =
    parseSearchParameters(searchTerm)

  const promises = [
    fetchSearchData(
      searchEndpoint +
        `subject=${subject}&number=${courseNumber}&term=1&campus=${campus}`
    ),
    fetchSearchData(
      searchEndpoint +
        `subject=${subject}&number=${courseNumber}&term=2&campus=${campus}`
    ),
  ]

  try {
    const [termOneData, termTwoData] = await Promise.all(promises)

    const searchTermFormattedForData = `${subject} ${courseNumber} ${sectionNumber}`

    let courseUrl
    try {
      courseUrl =
        getUrlFromSearchTerm(termOneData, searchTermFormattedForData) ||
        getUrlFromSearchTerm(termTwoData, searchTermFormattedForData)
    } catch (error) {
      console.error("Error extracting URL from search data:", error)
      return null
    }

    if (!courseUrl) {
      return null
    }

    try {
      const courseId = getCourseIdFromUrl(courseUrl)
      return courseId
    } catch (error) {
      console.error("Error extracting course ID from URL:", error)
      return null
    }
  } catch (error) {
    console.error("Error fetching course data:", error)
    return null
  }
}

export async function findCourseInfo(
  searchTerm: string
): Promise<ISectionData | null> {
  const courseId = await findCourseId(searchTerm)

  if (!courseId) {
    return null
  }

  const courseData: RawWorkdayData | null = await fetchWorkdayData(courseId)

  if (!courseData) {
    return null
  }

  const newSectionData: ISectionData = {
    code: searchTerm,
    name: courseData.name,
    instructors: courseData.instructors,
    sectionDetails: courseData.sectionDetails,
    term: courseData.term,
    worklistNumber: 0,
    color: defaultColorList[0],
    courseID: courseId,
  }
  return newSectionData
}
