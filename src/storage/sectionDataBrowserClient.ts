import Browser from "webextension-polyfill"
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

const readSectionData = async (): Promise<
  Result<ISectionData[], DataErrors[]>
> => {
  const rawSections = (await Browser.storage.local.get("sections")).sections as
    | string
    | undefined
  if (rawSections === undefined) return { ok: true, data: [] }
  const deserializedSections = loadSectionDataFromJSON(rawSections)
  return processRawSections(deserializedSections, sendProgressUpdateToAll)
}

const writeSectionData = async (newSections: ISectionData[]) => {
  const packagedData = packageCurrentData(newSections)
  const serializedData = convertSectionDataToJSON(packagedData)
  await Browser.storage.local.set({ sections: serializedData })
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

export {
  readSectionData,
  writeSectionData,
  writeNewSection,
  sendProgressUpdateToAll,
}
