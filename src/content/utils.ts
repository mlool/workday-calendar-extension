import { findCourseInfo } from "../backends/scheduler/nameSearchApi"
import { fetchSectionFromID } from "../backends/workday/idSearchApi"
import { handleCourseLoading } from "."

// bypassDetailsCheck is for reskin extension compat
async function extractSection(element: Element, bypassDetailsCheck?: boolean) {
  if (bypassDetailsCheck && bypassDetailsCheck === true) {
    return await findCourseInfo(element.id)
  }

  const courseId = extractIdFromDOM(element)

  if (!courseId) {
    handleCourseLoading(false)
    alert("Course ID not found, please manually add the section by url")
    return;
  }

  const fetchedSection = await fetchSectionFromID(courseId)

  if (!fetchedSection) {
    handleCourseLoading(false)
    alert("Section failed to be fetched")
    return;
  }

  if (!(await fetchedSection.saveToStorage())) {
    alert("Failed to Sync to Storage")
    return;
  }

  handleCourseLoading(false)
}

const extractIdFromDOM = (element: Element) => {
  const courseIdElement = element.querySelector(
    '[data-automation-id^="selectedItem_15194"]'
  )

  if (
    courseIdElement &&
    courseIdElement instanceof HTMLElement &&
    courseIdElement.dataset.automationId
  ) {
    const automationIdParts = courseIdElement.dataset.automationId.split("_")
    const courseId = automationIdParts[1].split("$")[1]

    return courseId
  } else {
    return null
  }
}

export {
  extractSection,
  extractIdFromDOM,
}
