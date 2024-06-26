import { ISectionData } from "./App/App.types"
import { findCourseInfo } from "../background/scheduler/nameSearchApi"

export async function extractSection(element: Element) {
  const courseLabels = element.parentElement?.querySelectorAll(
    '[data-automation-id="promptOption"]'
  ) // The div with the raw text of the course section data.
  // Checking if course labels exist and there are at least two of them
  if (!courseLabels || courseLabels.length < 2) {
    alert("Title or section details not found")
    return Promise.reject(new Error("Title or section details not found"))
  }

  // Extracting title
  const titleElement = courseLabels[0]
  const title = titleElement.textContent

  // Checking if title is missing
  if (!title) {
    alert("Title not found")
    return Promise.reject(new Error("Title not found"))
  }

  const code = title.slice(0, title.indexOf(" - "))

  const newSectionPromise = findCourseInfo(code, false)

  return Promise.all([newSectionPromise]).then(([newSection]) => {
    return newSection
  })
}

export function isCourseFormatted(courseName: string) {
  const regexV = /^[A-Z]{3}_V [0-9]+-[0-9]+$/
  const regexO = /^[A-Z]{3}_O [0-9]+-[0-9]+$/

  return regexV.test(courseName) || regexO.test(courseName)
}

export const filterSectionsByWorklist = (
  sections: ISectionData[],
  worklist: number
): ISectionData[] => {
  const sectionsForWorklist: ISectionData[] = []
  for (const section of sections) {
    if (section.worklistNumber === worklist) {
      sectionsForWorklist.push(section)
    }
  }
  return sectionsForWorklist
}

export const versionOneFiveZeroUpdateNotification = () => {
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
