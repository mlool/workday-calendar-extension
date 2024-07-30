import Browser from "webextension-polyfill"
import { findCourseId } from "../backends/scheduler/nameSearchApi"
import { ISectionData } from "../content/App//App.types"
//import { handleProgressUpdate } from "../content/ProgressBar/ProgressBar"
import {
  assignColors,
  ColorTheme,
} from "../content/Settings/Theme/courseColors"

const readSectionData = async (): Promise<ISectionData[]> => {
  // versions <= v1.4 used the sync storagearea
  const oldSections = await Browser.storage.sync.get("sections")
  if (oldSections.sections !== undefined) {
    console.log("Importing sections from sync storagearea...")
    await Browser.storage.sync.remove("sections")
    await Browser.storage.local.set({ sections: oldSections })
  }
  const rawSections = await Browser.storage.local.get("sections")
  // no matter the version, we need to check for empty IDs as there is a
  // chance queries for courseIDs failed, id could not be found, etc
  const sectionsWithIDs = await populateCourseIDs(rawSections as ISectionData[])
  return assignColors(sectionsWithIDs, ColorTheme.Green)
}

const writeSectionData = async (newSections: ISectionData[]) => {
  await Browser.storage.local.set({ sections: newSections })
}

const populateCourseIDs = async (
  oldSections: ISectionData[]
): Promise<ISectionData[]> => {
  const newSections = []
  for (const section of oldSections) {
    if (!section.courseID) {
      // we await each call individually here to prevent workday
      // from erroring out due to too many concurrent requests
      const newSection = {
        ...section,
        // eslint-disable-next-line no-await-in-loop
        courseID: (await findCourseId(section.code)) ?? undefined,
      }
      newSections.push(newSection)
      continue
    }
    newSections.push(section)
    //handleProgressUpdate(newSections.length / oldSections.length)
  }
  return newSections
}

export { readSectionData, writeSectionData }
