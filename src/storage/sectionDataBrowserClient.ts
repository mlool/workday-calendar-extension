import Browser from "webextension-polyfill"
import { ISectionData } from "../content/App/App.types"
import { DataErrors, Result } from "./errors"
import { ValidVersionData } from "./legacyStorageMigrators"
import { VersionWithNoNumber } from "./helpers/unnumberedVersionTypeGuards"
import { processRawSections } from "./sectionStorage"
import { handleProgressUpdate as modalProgressUpdater } from "../content/Settings/ExportImport/ExportImport"
import { handleProgressUpdate as mainProgressUpdater } from "../backends/scheduler/nameSearchHelpers"

const readSectionData = async (): Promise<
  Result<ISectionData[], DataErrors[]>
> => {
  // versions <= v1.4 used the sync storagearea
  const oldSections = await Browser.storage.sync.get("sections")
  if (oldSections.sections !== undefined) {
    console.log("Importing sections from sync storagearea...")
    await Browser.storage.sync.remove("sections")
    await Browser.storage.local.set({ sections: oldSections })
  }

  const rawSections = (await Browser.storage.local.get("sections")).sections as
    | ValidVersionData
    | VersionWithNoNumber
    | undefined
  return processRawSections(rawSections, sendProgressUpdateToAll)
}

const writeSectionData = async (newSections: ISectionData[]) => {
  const serializedData = { version: "2.0.1", data: newSections }
  await Browser.storage.local.set({ sections: serializedData })
}

const sendProgressUpdateToAll = (update: number) => {
  modalProgressUpdater(update)
  mainProgressUpdater(update)
}

export { readSectionData, writeSectionData, sendProgressUpdateToAll }
