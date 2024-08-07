import Browser from "webextension-polyfill"
import { ISectionData } from "../content/App//App.types"
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

  const rawSections = (await Browser.storage.local.get("sections")).sections as
    | ValidVersionData
    | VersionWithNoNumber
    | undefined
  return processRawSections(rawSections)
}

const processRawSections = async (
  rawSections: ValidVersionData | VersionWithNoNumber | undefined
): Promise<ISectionData[]> => {
  if (rawSections === undefined) return []
  if (Array.isArray(rawSections) && rawSections.length === 0) return []

  const extractedSections = isVersionWithNumber(rawSections)
    ? rawSections
    : manuallyDetermineVersion(rawSections)

  if (extractedSections.data.length === 0) return []
  return await sectionDataAutoMigrator(extractedSections)
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

/**
 * Convenience function to deserialize sections from JSON, using a
 * custom reviver to convert JSONified `Set`s represented as arrays
 * back to actual `Set`s.
 */
const loadSectionDataFromJSON = (
  input: string
): VersionWithNoNumber | ValidVersionData => {
  return JSON.parse(input, (key: string, value: unknown) => {
    if (key === "terms") {
      return new Set((value as []).slice(1))
    }
    return value
  })
}

/**
 * Convenience function to serialize sections to JSON, using a custom
 * replacer since `Set`s aren't JSON-able on their own.
 */
const convertSectionDataToJSON = (input: ISectionData[]): string => {
  return JSON.stringify(
    input,
    (key: unknown, value: unknown) => {
      if (value instanceof Set) {
        return ["_isSet", ...value]
      }
      return value
    },
    2
  )
}

const writeSectionData = async (newSections: ISectionData[]) => {
  const serializedData = { version: "2.0.1", data: newSections }
  await Browser.storage.local.set({ sections: serializedData })
}

export {
  readSectionData,
  writeSectionData,
  loadSectionDataFromJSON,
  convertSectionDataToJSON,
  processRawSections,
  sectionDataAutoMigrator,
}
