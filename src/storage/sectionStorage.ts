import Browser from "webextension-polyfill"
import { ISectionData } from "../content/App//App.types"
import {
  assignColors,
  ColorTheme,
} from "../content/Settings/Theme/courseColors"
import {
  v1_4_1,
  v1_5_0,
  v2_0_0,
  ValidVersionData,
} from "./legacyStorageMigrators"

const readSectionData = async (): Promise<ISectionData[]> => {
  // versions <= v1.4 used the sync storagearea
  const oldSections = await Browser.storage.sync.get("sections")
  if (oldSections.sections !== undefined) {
    console.log("Importing sections from sync storagearea...")
    await Browser.storage.sync.remove("sections")
    await Browser.storage.local.set({ sections: oldSections })
  }
  const rawSections = (await Browser.storage.local.get(
    "sections"
  )) as ValidVersionData
  // TODO: version number check
  const processedSections = await sectionDataAutoMigrator("2.0.1", rawSections)
  return assignColors(processedSections, ColorTheme.Green)
}

// TODO: is there a clean, mostly type-safe, non-recursive way of doing this?
// switch statement + fallthru would work but requires a lot of type casting
const sectionDataAutoMigrator = async (
  version: string,
  oldSections: ValidVersionData
): Promise<ISectionData[]> => {
  // base case
  if (version === "2.0.1") return oldSections as ISectionData[]

  // recursive case
  const version_map: Record<string, CallableFunction> = {
    "1.4.1": v1_4_1,
    "1.5.0": v1_5_0,
    "1.6.0": v2_0_0,
    "2.0.0": v2_0_0,
  }
  const migratorFn = version_map[version]
  if (migratorFn !== undefined) {
    // TODO: version number check
    return await sectionDataAutoMigrator("2.0.1", await migratorFn(oldSections))
  }
  throw Error(
    `Version ${version} could not be properly migrated! Are you sure this version of the extension supports this format?`
  )
}

const writeSectionData = async (newSections: ISectionData[]) => {
  await Browser.storage.local.set({ sections: newSections })
}

export { readSectionData, writeSectionData }
