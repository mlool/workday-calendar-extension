import { ISectionData, Term } from "./App/App.types"
import { findCourseInfo } from "../backends/scheduler/nameSearchApi"
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

  const code = title.slice(0, title.indexOf(" - "))

  const newSectionPromise = findCourseInfo(code)

  return Promise.all([newSectionPromise]).then(([newSection]) => {
    return newSection
  })
}

const filterSections = (
  sections: ISectionData[],
  worklist: number,
  term: Term
): ISectionData[] => {
  return sections.filter(
    (s) =>
      s.worklistNumber === worklist &&
      (s.term === term || s.term === Term.winterFull)
  )
}

const versionOneFiveZeroUpdateNotification = () => {
  const currentVersion = chrome.runtime.getManifest().version
  chrome.storage.local
    .get("versionOneFiveZeroNotificationDisplayed")
    .then((retrievedFlag) => {
      const flag =
        retrievedFlag?.versionOneFiveZeroNotificationDisplayed ?? false
      if (!flag && currentVersion === "1.5.1") {
        alert(
          "Welcome to version 1.5.0! This update includes many changes and a full changelog can be viewed on our communication platforms. Please note that for the best results, it is recommended to sign out and then sign back in as well as exporting all of your worklists and them importing them back in to ensure all features are working correctly. Thank you for using the Workday Extension!"
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
}
