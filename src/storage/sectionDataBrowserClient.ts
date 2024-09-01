// import Browser from "webextension-polyfill"
import { ISectionData } from "../content/App/App.types"
import { DataErrors, Result } from "./errors"
import {
  processRawSections,
  convertSectionDataToJSON,
  loadSectionDataFromJSON,
  packageCurrentData,
} from "./sectionStorage"
import { handleProgressUpdate as modalProgressUpdater } from "../content/Settings/ExportImport/ExportImport"
import { handleProgressUpdate as mainProgressUpdater } from "../backends/scheduler/nameSearchHelpers"
import { VersionWithNoNumber } from "./helpers/unnumberedVersionTypeGuards"
import { ValidVersionData } from "./legacyStorageMigrators"
import { ModalAction } from "../content/ModalLayer"

type SectionImporter = (
  newData: string | undefined,
  modalDispatcher: React.Dispatch<ModalAction>,
  worklistNumber?: number
) => Promise<void>

const readSectionData = async (): Promise<
  Result<ISectionData[], DataErrors[]>
> => {
  const rawSections = (await chrome.storage.local.get("sections")).sections as
    | string
    | undefined
    // note: eventually when all supported versions store their data
    // as a JSON string (so versions 2.1+), we can drop these.
    | VersionWithNoNumber
    | ValidVersionData
  if (rawSections === undefined) return { ok: true, data: [] }
  const deserializedSections =
    typeof rawSections === "string"
      ? loadSectionDataFromJSON(rawSections)
      : // note: eventually when all supported versions store their data
        // as a JSON string (so versions 2.1+), we can drop this condition.
        rawSections
  return processRawSections(deserializedSections, sendProgressUpdateToAll)
}

const writeSectionData = async (newSections: ISectionData[]) => {
  const packagedData = packageCurrentData(newSections)
  const serializedData = convertSectionDataToJSON(packagedData)
  // await Browser.storage.local.set({ sections: serializedData })
  await chrome.storage.local.set({ sections: serializedData })
}

const writeNewSection = async (selectedSection: ISectionData) => {
  const serializedSection = convertSectionDataToJSON(selectedSection)
  // clear any previous values to avoid silent errors
  await chrome.storage.local.set({ newSection: null })
  await chrome.storage.local.set({ newSection: serializedSection })
}

const sendProgressUpdateToAll = (update: number) => {
  modalProgressUpdater(update)
  mainProgressUpdater(update)
}

const downloadSectionsAsJSON = async (
  sections: ISectionData[],
  worklistNumber?: number
) => {
  const finalSections =
    worklistNumber !== undefined
      ? sections.filter((section) => section.worklistNumber === worklistNumber)
      : sections
  if (finalSections.length === 0) {
    return alert("Please Select A Worklist That Is Not Empty!")
  }
  const json = convertSectionDataToJSON(packageCurrentData(finalSections))
  const blob = new Blob([json], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = "schedule.json"
  link.click()
  URL.revokeObjectURL(url)
}

export {
  type SectionImporter,
  readSectionData,
  writeSectionData,
  writeNewSection,
  sendProgressUpdateToAll,
  downloadSectionsAsJSON,
}
