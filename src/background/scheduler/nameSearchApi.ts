import { ISectionData } from "../../content/App/App.types"
import { defaultColorList } from "../../helpers/courseColors"
import {
  getUrlFromSearchTerm,
  formatSearchTermForData,
  getCourseIdFromUrl,
  fetchSearchData,
  parseSearchParameters,
} from "./nameSearchHelpers"
import { fetchWorkdayData } from "../workday/idSearchApi"
import { RawWorkdayData } from "../workday/idSearchHelpers"

const searchEndpoint =
  "https://coursescheduler-api-2.vercel.app/api/W/sections?"

export async function findCourseId(searchTerm: string): Promise<string> {
  const { subject, courseNumber, campus } = parseSearchParameters(searchTerm)

  const termOneData = await fetchSearchData(
    searchEndpoint +
      `subject=${subject}&number=${courseNumber}&term=1&campus=${campus}`
  )

  const termTwoData = await fetchSearchData(
    searchEndpoint +
      `subject=${subject}&number=${courseNumber}&term=2&campus=${campus}`
  )

  const searchTermFormattedForData = formatSearchTermForData(searchTerm)

  const courseUrl =
    getUrlFromSearchTerm(termOneData, searchTermFormattedForData) ||
    getUrlFromSearchTerm(termTwoData, searchTermFormattedForData)

  if (!courseUrl) {
    return ""
  }

  const courseId = getCourseIdFromUrl(courseUrl)

  return courseId
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
