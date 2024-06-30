import { ISectionData } from "../../content/App/App.types"
import { defaultColorList } from "../../content/Settings/Theme/courseColors"
import {
  getUrlFromSearchTerm,
  getCourseIdFromUrl,
  fetchSearchData,
  parseSearchParameters,
  courseIdFailsCheck,
  handleProgressUpdate,
} from "./nameSearchHelpers"
import { fetchWorkdayData } from "../workday/idSearchApi"
import { RawWorkdayData } from "../workday/idSearchHelpers"
import { handleCourseLoading } from "../../content"

const searchEndpoint =
  "https://coursescheduler-api-2.vercel.app/api/W/sections?"

export async function findCourseId(searchTerm: string): Promise<string | null> {
  handleProgressUpdate(25)
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
    handleProgressUpdate(50)

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
      handleCourseLoading(false)
      alert(`Oops something went wrong. Please try to use the "Add Course By Link" feature. If the issue persists, please contact the developers.`)
      return null
    }

    try {
      const courseId = getCourseIdFromUrl(courseUrl)
      handleProgressUpdate(60)

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
  searchTerm: string,
  manualCourseEntry?: string
): Promise<ISectionData | null> {
  let courseId: string | null = null

  if (manualCourseEntry) {
    courseId = getCourseIdFromUrl(manualCourseEntry!)

    if (courseId && courseIdFailsCheck(courseId)) {
      alert("Invalid URL. Please try again.")
    }
  } else {
    courseId = await findCourseId(searchTerm)
  }

  if (!courseId) {
    return null
  }

  const courseData: RawWorkdayData | null = await fetchWorkdayData(courseId)
  if (!courseData) {
    return null
  }
  handleProgressUpdate(90)

  const newSectionData: ISectionData = {
    code: courseData.code,
    name: courseData.name,
    instructors: courseData.instructors,
    sectionDetails: courseData.sectionDetails,
    term: courseData.term,
    worklistNumber: 0,
    color: defaultColorList[0],
    courseID: courseId,
  }
  handleProgressUpdate(95)

  return newSectionData
}
