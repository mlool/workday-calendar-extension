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
import {
  isVersionWithNumber,
  manuallyDetermineVersion,
  VersionWithNoNumber,
} from "./helpers/unnumberedVersionTypeGuards"

const readSectionData = async (): Promise<ISectionData[]> => {
  // versions <= v1.4 used the sync storagearea
  const oldSections = await Browser.storage.sync.get("sections")
  if (oldSections.sections !== undefined) {
    console.log("Importing sections from sync storagearea...")
    await Browser.storage.sync.remove("sections")
    await Browser.storage.local.set({ sections: oldSections })
  }

  const rawSections = (await Browser.storage.local.get("sections")) as
    | ValidVersionData
    | VersionWithNoNumber
  const extractedSections = isVersionWithNumber(rawSections)
    ? rawSections
    : manuallyDetermineVersion(rawSections)

  const processedSections = await sectionDataAutoMigrator(extractedSections)
  return assignColors(processedSections, ColorTheme.Green)
}

/**
 * Type-safe section data migration function. Recursively updates
 * the data to newer and newer versions until it reaches current
 * version.
 */
const sectionDataAutoMigrator = async (
  input: ValidVersionData
): Promise<ISectionData[]> => {
  switch (input.version) {
    case "2.0.1":
      return input.data as ISectionData[]
    case "1.6.0":
    case "2.0.0":
      return sectionDataAutoMigrator({
        version: "2.0.1",
        data: v2_0_0(input.data),
      })
    case "1.5.0":
      return sectionDataAutoMigrator({
        version: "2.0.0",
        data: await v1_5_0(input.data),
      })
    case "1.4.1":
      return sectionDataAutoMigrator({
        version: "2.0.0",
        data: await v1_4_1(input.data),
      })
    default:
      throw Error(
        // @ts-expect-error    this case shouldn't ever be possible, but on
        // the off chance that it actually is, i'd like to get a runtime
        // error for it
        `Version ${input.version} could not be properly migrated! Are you sure this version of the extension supports this format?`
      )
  }
}

const writeSectionData = async (newSections: ISectionData[]) => {
  await Browser.storage.local.set({ sections: newSections })
}

export { readSectionData, writeSectionData, sectionDataAutoMigrator }
