import { ISectionData, Term } from "./App/App.types"
import { findCourseInfo } from "../backends/scheduler/nameSearchApi"
import { fetchWorkdayData } from "../backends/workday/idSearchApi"
import { handleCourseLoading } from "."

// bypassDetailsCheck is for reskin extension compat
async function extractSection(element: Element, bypassDetailsCheck?: boolean) {
  if (bypassDetailsCheck && bypassDetailsCheck === true) {
    return await findCourseInfo(element.id)
  }

  const courseLabels = element.parentElement?.querySelectorAll(
    '[data-automation-id="promptOption"]'
  ) // The div with the raw text of the course section data.
  // Checking if course labels exist and there are at least two of them

  if (!courseLabels || courseLabels.length < 2) {
    handleCourseLoading(false)
    alert("Title or section details not found")
    return Promise.reject(new Error("Title or section details not found"))
  }

  // Extracting title
  const titleElement = courseLabels[0]
  const title = titleElement.textContent

  // Checking if title is missing
  if (!title) {
    handleCourseLoading(false)
    alert("Title not found")
    return Promise.reject(new Error("Title not found"))
  }

  const courseId = extractIdFromDOM(element)

  // If courseId is found, fetch the data from Workday dirctly
  // Otherwise, find the course info from the course code using scheduler API
  if (courseId) {
    return await fetchWorkdayData(courseId)
  } else {
    const code = title.slice(0, title.indexOf(" - "))

    const newSectionPromise = findCourseInfo(code)

    return Promise.all([newSectionPromise]).then(([newSection]) => {
      return newSection
    })
  }
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

const filterSections = (
  sections: ISectionData[],
  worklist: number,
  term: Term | Set<Term>
): ISectionData[] => {
  return sections.filter(
    (s) =>
      s.worklistNumber === worklist &&
      (term instanceof Set
        ? s.terms.isSupersetOf(term)
        : s.terms.has(term as Term))
  )
}

const versionOneFiveZeroUpdateNotification = () => {
  const currentVersion = chrome.runtime.getManifest().version
  chrome.storage.local
    .get("versionOneFiveZeroNotificationDisplayed")
    .then((retrievedFlag) => {
      const flag =
        retrievedFlag?.versionOneFiveZeroNotificationDisplayed ?? false
      if (!flag && currentVersion === "1.6.0") {
        alert(
          "Welcome to version 1.6.0! This update includes many changes and a full changelog can be viewed on our communication platforms. Please note that for the best results, it is recommended to sign out and then sign back in as well as exporting all of your worklists and them importing them back in to ensure all features are working correctly. Thank you for using the Workday Extension!"
        )
        chrome.storage.local.set({
          versionOneFiveZeroNotificationDisplayed: true,
        })
      }
    })
    .catch((error) => console.error("Error retrieving flag:", error))
}

export {
  versionOneFiveZeroUpdateNotification,
  filterSections,
  extractSection,
  extractIdFromDOM,
}
